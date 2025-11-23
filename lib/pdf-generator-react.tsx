import { ProposalData } from '@/types';
import { ProposalPDFDocument } from './proposal-pdf-document';
import { renderToBuffer } from '@react-pdf/renderer';

export async function generateProposalPDF(data: ProposalData) {
  const pdfBuffer = await renderToBuffer(<ProposalPDFDocument data={data} />);
  return pdfBuffer;
}
