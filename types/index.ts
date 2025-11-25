export interface CoverageField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
}

export interface CoverageTemplate {
  title: string;
  fields: CoverageField[];
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email?: string;
  phone?: string;
}

export interface AgentInfo {
  name: string;
  phone?: string;
  email?: string;
  title?: string;
  address?: string;
  website?: string;
  photo?: string;
}

export interface Coverage {
  [key: string]: string | number | undefined;
  current_premium: string;
  proposed_premium: string;
  current_carrier?: string;
  proposed_carrier: string;
}

export interface UploadedFiles {
  currentDecPages: string[];
  newProposals: string[];
}

export interface ProposalData {
  proposalDate: string;
  clientInfo: ClientInfo;
  agentInfo: AgentInfo;
  teamMembers?: AgentInfo[]; // Additional team members beyond primary agent
  coverages: {
    [key: string]: Coverage;
  };
  executiveSummary?: string;
  notes?: string;
  agencyLogo?: string;
  agencyName?: string;
  agentPhoto?: string;
  uploadedFiles?: UploadedFiles;
}

export type CoverageType =
  | 'homeowners'
  | 'condo'
  | 'wind'
  | 'auto'
  | 'umbrella'
  | 'watercraft'
  | 'jewelry'
  | 'cyber'
  | 'fineart'
  | 'other';
