# Research collection: model and autoplay revision

Reviewed September 16, 2026. New references supplement the previous Bruno Simon,
Clay Boan, and Lusion/Oryzo research in `motion-references.md`.

## Still — Ming Jyun Hung

Primary creator breakdown:
https://tympanus.net/codrops/2026/09/09/still-from-akira-to-ink-wash-building-a-generative-garden-in-webgpu/

Experience: https://still.mingjyunhung.com/

The creator explains how tapered curve sweeps, attached leaves, component timing,
and a coherent material treatment build a procedural plant. The useful design
lesson here is continuous, shaped branching with parts that remain attached while
moving. The portfolio's neuron and landscape are original geometry; no astronaut,
flower asset, shader source, or artwork was copied. The portfolio continues to use
WebGL; it does not claim to reproduce Still's WebGPU/VAT pipeline.

## Turning Names Into Digital Architecture — BL/S

Primary creator breakdown:
https://tympanus.net/codrops/2026/09/09/turning-names-into-digital-architecture-with-three-js/

The creator describes curved structural geometry with longitudinal members,
bracing, and an inexpensive reflective appearance. This informed the emphasis on
legible structure and material response. The processor's original board layers,
traces, fasteners, and cooling fins give its silhouette a purpose.

## Three.js physical material examples

https://threejs.org/docs/pages/MeshPhysicalMaterial.html
https://threejs.org/examples/webgl_materials_physical_transmission.html

The official documentation distinguishes clearcoat, metal response, transmission,
roughness, and environment lighting, and notes the extra pixel cost. The collection
uses restrained clearcoat on coated components, metal finishes for traces and
fasteners, and a small amount of transmission for selected inset parts. Environment
lighting is generated locally; no external texture is required at runtime.

## Other creator reviews

https://tympanus.net/codrops/2026/09/14/inside-resns-digital-experiences/
https://tympanus.net/codrops/2026/09/12/yestalgia-bringing-decathlons-90s-spirit-to-life-through-a-playful-digital-experience/

These supplied editorial and timing references. Yestalgia explicitly explains
that its apparent 3D interface is not actual 3D; it is not cited as evidence of
a Three.js implementation. Resn's studio article is a design reference, not proof
of a specific engine behind each featured site.

A bounded isolated Chrome inspection rendered the official transmission demo.
Still's live site stopped at a verification page; its creator breakdown and
published visuals were used instead. The linked BL/S Webflow landing was blank
in the timed capture, so its implementation description comes from the creator
article. These captures are not claimed as a full live-site interaction review.

## Autoplay contract

Plain visits autoplay without a query parameter or a Play click. Pausing affects
the current page; an older stored pause is ignored and removed so reopening does
not silently freeze the models. Explicit Play opt-in may be remembered for visitors
who prefer it over their device's reduced-motion default. Otherwise the device's
reduced-motion preference still starts with a static model and an enabled Play
control. Use device setting clears that opt-in. Theme persistence is unchanged.

Validation must sample visible PNG pixels after initial assembly on plain visits,
including a visit with a legacy paused value. Checks must not click Play to make
an autoplay test pass. Paused pixels and animation time must remain stable.
