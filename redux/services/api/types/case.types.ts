export interface Case {
  id: number;
  case_number: string;
  title: string;
  address: string;
  status: string;
  owner_id: number;
  reporter_name: string;
  created_at: string;
}

export interface CasesResponse {
  cases: Case[];
  total: number;
  page: number;
  page_size: number;
}

export interface CaseDetails {
  id: number;
  case_number: string;
  status: string;
  date_reported: string;
  approved_by: string;
  location: string;
  description: string;
  reporter: {
    name: string;
    phone: string;
    email: string;
  };
  evidence: Array<{
    filename: string;
    file_url: string;
    file_type: string;
    uploaded_at: string;
  }>;
}

export interface UpdateCaseStatusRequest {
  status: string;
}

export interface UpdateCaseStatusResponse {
  message: string;
  success?: boolean;
}