import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Fondo de degradado animado en WebGL2.
 *
 * Adaptado del componente original, que venía pensado para shadcn + TypeScript +
 * Next.js: se quitaron los tipos, el `"use client"`, el helper `cn` y el
 * `WebGLErrorBoundary` externo (aquí el respaldo va integrado). El shader es el
 * mismo.
 *
 * Si WebGL2 falla o el equipo va justo, se pinta un degradado CSS equivalente en
 * vez de dejar un hueco.
 */

const PATTERN_SHAPES = { Checks: 0, Stripes: 1, Edge: 2 }

const DEFAULTS = {
  rotation: 0,
  proportion: 35,
  scale: 1,
  speed: 25,
  distortion: 12,
  swirl: 80,
  swirlIterations: 10,
  softness: 100,
  offset: 0,
  shape: 'Checks',
  shapeSize: 10,
}

export default function AnimatedGradient({
  config,
  noise,
  radius = '0px',
  className = '',
  fallbackBackground,
  paused = false,
  style,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const frameRef = useRef()
  const startRef = useRef(0)
  const pausedRef = useRef(paused)
  const [failed, setFailed] = useState(false)

  pausedRef.current = paused

  const params = useMemo(() => ({ ...DEFAULTS, ...config }), [config])

  useEffect(() => {
    if (failed || paused) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let gl
    let program
    let vertexShader
    let fragmentShader
    let buffer
    let observer

    try {
      gl = canvas.getContext('webgl2', {
        premultipliedAlpha: true,
        alpha: true,
        antialias: true,
      })
      if (!gl) {
        setFailed(true)
        return
      }

      const compile = (type, source) => {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader)
          return null
        }
        return shader
      }

      vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
      fragmentShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
      if (!vertexShader || !fragmentShader) {
        setFailed(true)
        return
      }

      program = gl.createProgram()
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        setFailed(true)
        return
      }
      gl.useProgram(program)

      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      )
      const positionLocation = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      const u = Object.fromEntries(
        [
          'u_time',
          'u_resolution',
          'u_pixelRatio',
          'u_scale',
          'u_rotation',
          'u_color1',
          'u_color2',
          'u_color3',
          'u_proportion',
          'u_softness',
          'u_shape',
          'u_shapeScale',
          'u_distortion',
          'u_swirl',
          'u_swirlIterations',
        ].map((name) => [name, gl.getUniformLocation(program, name)]),
      )

      // El lienzo se limita a 1.5x para no pintar un shader a resolución retina
      // completa: en esta sección no se nota y ahorra bastante. En táctil se baja
      // a 1x, que es lo que hace viable dejarlo encendido en el móvil.
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const maxRatio = coarse ? 1 : 1.5
      const resize = () => {
        const width = container.clientWidth
        const height = container.clientHeight
        const ratio = Math.min(window.devicePixelRatio || 1, maxRatio)
        canvas.width = Math.max(1, Math.round(width * ratio))
        canvas.height = Math.max(1, Math.round(height * ratio))
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      resize()
      observer = new ResizeObserver(resize)
      observer.observe(container)

      const c1 = toRgba(params.color1)
      const c2 = toRgba(params.color2)
      const c3 = toRgba(params.color3)
      startRef.current = performance.now()

      const draw = (time) => {
        frameRef.current = requestAnimationFrame(draw)
        if (pausedRef.current) return

        const elapsed = (time - startRef.current) / 1000
        const speed = (params.speed / 100) * 5

        gl.uniform1f(u.u_time, elapsed * speed + params.offset * 0.01)
        gl.uniform2f(u.u_resolution, canvas.width, canvas.height)
        gl.uniform1f(u.u_pixelRatio, Math.min(window.devicePixelRatio || 1, maxRatio))
        gl.uniform1f(u.u_scale, params.scale)
        gl.uniform1f(u.u_rotation, (params.rotation * Math.PI) / 180)
        gl.uniform4f(u.u_color1, c1[0], c1[1], c1[2], c1[3])
        gl.uniform4f(u.u_color2, c2[0], c2[1], c2[2], c2[3])
        gl.uniform4f(u.u_color3, c3[0], c3[1], c3[2], c3[3])
        gl.uniform1f(u.u_proportion, params.proportion / 100)
        gl.uniform1f(u.u_softness, params.softness / 100)
        gl.uniform1f(u.u_shape, PATTERN_SHAPES[params.shape] ?? 0)
        gl.uniform1f(u.u_shapeScale, params.shapeSize / 100)
        gl.uniform1f(u.u_distortion, params.distortion / 50)
        gl.uniform1f(u.u_swirl, params.swirl / 100)
        gl.uniform1f(u.u_swirlIterations, params.swirl === 0 ? 0 : params.swirlIterations)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      frameRef.current = requestAnimationFrame(draw)
    } catch {
      setFailed(true)
      return
    }

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current)
      observer?.disconnect()
      if (gl) {
        if (program) gl.deleteProgram(program)
        if (vertexShader) gl.deleteShader(vertexShader)
        if (fragmentShader) gl.deleteShader(fragmentShader)
        if (buffer) gl.deleteBuffer(buffer)
      }
    }
  }, [failed, paused, params])

  if (failed || paused) {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={{ borderRadius: radius, background: fallbackBackground, ...style }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {noise && noise.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${NOISE_PNG}")`,
            backgroundSize: (noise.scale ?? 1) * 200,
            backgroundRepeat: 'repeat',
            opacity: noise.opacity / 2,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

const NOISE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEUAAAAAAAAAAAAAAAAAAAAAAADgKxmiAAAABnRSTlMCCgkGBAVJOAVJAAAASklEQVQ4y2NgGAWjYBSMglEwCgY/YGRgZBQUYmJiZGQEkYwMjIyMgoKCjIyMIJKBgRFIMjIyAklGRkYGRkFBYEcwMDIyMjAOUQAA1I4HwVwZAkYAAAAASUVORK5CYII='

function toRgba(input) {
  const hex = String(input ?? '#000000')
  if (hex.startsWith('#')) {
    const c = hex.slice(1)
    if (c.length === 3) {
      return [
        parseInt(c[0] + c[0], 16) / 255,
        parseInt(c[1] + c[1], 16) / 255,
        parseInt(c[2] + c[2], 16) / 255,
        1,
      ]
    }
    return [
      parseInt(c.slice(0, 2), 16) / 255,
      parseInt(c.slice(2, 4), 16) / 255,
      parseInt(c.slice(4, 6), 16) / 255,
      c.length === 8 ? parseInt(c.slice(6, 8), 16) / 255 : 1,
    ]
  }
  if (hex.startsWith('rgb')) {
    const parts = hex.slice(hex.indexOf('(') + 1, -1).split(',')
    return [
      parseInt(parts[0], 10) / 255,
      parseInt(parts[1], 10) / 255,
      parseInt(parts[2], 10) / 255,
      parts[3] !== undefined ? parseFloat(parts[3]) : 1,
    ]
  }
  return [0, 0, 0, 1]
}

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
    float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);

    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float t = .5 * u_time;

    float noise_scale = .0005 + .006 * u_scale;

    uv -= .5;
    uv *= (noise_scale * u_resolution);
    uv = rotate(uv, u_rotation * .5 * PI);
    uv /= u_pixelRatio;
    uv += .5;

    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += 4. * u_distortion * n2 * cos(angle);
    uv.y += 4. * u_distortion * n2 * sin(angle);

    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (float i = 1.; i <= iterations_number; i++) {
        uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
    }

    float proportion = clamp(u_proportion, 0., 1.);

    float shape = 0.;
    float mixer = 0.;
    if (u_shape < .5) {
      vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
      shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else if (u_shape < 1.5) {
      vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
      float f = fract(stripes_shape_uv.y);
      shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else {
      float sh = 1. - uv.y;
      sh -= .5;
      sh /= (noise_scale * u_resolution.y);
      sh += .5;
      float shape_scaling = .2 * (1. - u_shapeScale);
      shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
      mixer = shape;
    }

    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);

    fragColor = vec4(color_mix.rgb, color_mix.a);
}
`
