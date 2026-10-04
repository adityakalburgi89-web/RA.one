# Level one asset notes

`Vana Path` does not fetch or package any new third-party model from the linked
Sketchfab collection. The jungle terrain, foliage, shrine, ruins, water, mist,
fireflies, and particles are authored as Three.js geometry and canvas textures
in `src/3d/JungleWorld3D.ts`.

The painted mountain layers used by the level are existing, locally supplied
workspace artwork under `public/images/ravan-kailash-elements/`. They remain
owned and licensed exactly as they were when supplied to this project.

The terrain now uses a full 1K diffuse / OpenGL normal / roughness PBR set from
Poly Haven. It is CC0; the source, author, and exact files are recorded in
`public/textures/polyhaven/LICENSES.md`.

The referenced Sketchfab collection is useful visual research, but it contains
many separately authored models. A collection's download label does not provide
a blanket licence. Before importing any of its models, record the individual
model URL, creator, licence (for example CC BY / CC0), and required attribution
in this file.
