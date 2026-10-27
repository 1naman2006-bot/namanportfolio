/**
 * The four portfolio categories. The `id` is what you put in a project's
 * `category` field and is also the URL: /work/<id>
 */
export const CATEGORIES = [
  {
    id: 'photoshop',
    name: 'Photoshop',
    tool: 'Adobe Photoshop',
    mark: 'Ps',
    short: 'Posters, ads, compositing and retouching.',
    intro:
      'Graphic design and image work built in Photoshop — posters and advertisements, photo manipulation, retouching, compositing and promotional graphics.',
    types: ['Posters & ads', 'Photo manipulation', 'Retouching', 'Compositing', 'Creative artwork', 'Promotional graphics'],
    media: 'image',
  },
  {
    id: 'after-effects',
    name: 'After Effects',
    tool: 'Adobe After Effects',
    mark: 'Ae',
    short: 'Motion graphics, typography and VFX.',
    intro:
      'Motion design made in After Effects — kinetic typography, title sequences, logo animation, compositing, VFX and promotional animation.',
    types: ['Motion graphics', 'Kinetic typography', 'Title sequences', 'Logo animation', 'Compositing & VFX', 'Experimental'],
    media: 'video',
  },
  {
    id: 'premiere-pro',
    name: 'Premiere Pro',
    tool: 'Adobe Premiere Pro',
    mark: 'Pr',
    short: 'Cinematic edits, reels and colour.',
    intro:
      'Editing and storytelling cut in Premiere Pro — cinematic edits, music videos, beat-sync edits, commercials, social reels, travel films and colour grading.',
    types: ['Cinematic edits', 'Music videos', 'Beat-sync', 'Commercials', 'Social reels', 'Travel films', 'Colour grading'],
    media: 'video',
  },
  {
    id: 'maya',
    name: 'Maya',
    tool: 'Autodesk Maya',
    mark: 'M',
    short: 'Modelling, look development and renders.',
    intro:
      '3D work built in Autodesk Maya — modelling, texturing, lighting and look development, product visualisation, environments, animation and rendering.',
    types: ['Modelling', 'Texturing', 'Lighting & lookdev', 'Product visualisation', 'Environments', 'Animation', 'Turntables'],
    media: 'mixed',
  },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
