import type { ProposalVisual } from './proposal-visuals';

function safePart(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'conceito';
}

export function downloadProposalPng(blob: Blob, proposalId: string, visualId: string, canExport: boolean): void {
  if (canExport !== true) throw new Error('A proposta precisa estar liberada para exportação.');
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  try {
    link.href = url;
    link.download = `proposta-${safePart(proposalId)}-${safePart(visualId)}.png`;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    // Give the browser time to consume the click before releasing the download URL.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}


/** Browser-only rasterization of concepts produced by generateProposalVisuals. */
export async function proposalVisualToPng(visual: ProposalVisual, canExport: boolean): Promise<Blob> {
  if (canExport !== true) throw new Error('A proposta precisa estar liberada para exportação.');
  const url = URL.createObjectURL(new Blob([visual.svg], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Não foi possível carregar a imagem da proposta.'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = visual.width;
    canvas.height = visual.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas indisponível para gerar o PNG.');
    context.drawImage(image, 0, 0, visual.width, visual.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Não foi possível gerar o arquivo PNG.'));
    }, 'image/png'));
  } finally {
    image.onload = null;
    image.onerror = null;
    URL.revokeObjectURL(url);
  }
}
