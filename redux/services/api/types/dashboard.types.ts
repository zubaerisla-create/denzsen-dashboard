export interface WeeklyOverviewItem {
  day: string;
  count: number;
}

export interface StatusDistribution {
  active: number;
  pending: number;
  resolved: number;
  total: number;
}

export interface ChartsResponse {
  weekly_overview: WeeklyOverviewItem[];
  status_distribution: StatusDistribution;
}

export interface RecentCase {
  id: string;
  status: string;
  location: string;
  reported_by: string;
  created_at: string;
}

export interface TotalCasesData {
  count: number;
  growth_percent: number;
}

export interface NewCasesTodayData {
  count: number;
  increase_from_yesterday: number;
}

export interface ActiveCasesData {
  total: number;
  pending_count: number;
}

export interface DashboardStatsResponse {
  total_cases: TotalCasesData;
  new_cases_today: NewCasesTodayData;
  active_cases: ActiveCasesData;
}