import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { downloadMemberExcelAPI, downloadMemberBillsAPI } from '@/api/member';
import { Colors } from '@/theme';

const MEMBER_FILTERS = [
  { label: 'All Members', value: 'totalRegUser' },
  { label: 'Active Members', value: 'memberWhoseMembershipIsActive' },
  { label: 'Inactive Members', value: 'memberWhoseMembershipExpire' },
  { label: 'Expiry in 1-3 days', value: 'membershipExpireInOneToThreeDays' },
  { label: 'Expiry in 4-7 days', value: 'membershipExpireInFourtoSevenDays' },
  { label: 'Expiry in 7-15 days', value: 'membershipExpireInSevenToFifteenDays' },
  { label: 'Partial Paid Members', value: 'partialPaidPackage' },
  { label: 'Unpaid Members', value: 'unpaidPackage' },
  { label: 'Blocked Members', value: 'getBlockUser' },
];

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const startStr = start.toISOString().split('T')[0] ?? '';
  const endStr = now.toISOString().split('T')[0] ?? '';
  return { startStr, endStr };
}

export default function DownloadReportPage() {
  const navigate = useNavigate();
  const { startStr, endStr } = getDefaultDateRange();

  const [reportType, setReportType] = useState<'member' | 'bill'>('member');
  const [memberFilter, setMemberFilter] = useState('');
  const [fileType, setFileType] = useState('excel');
  const [startDate, setStartDate] = useState(startStr);
  const [endDate, setEndDate] = useState(endStr);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const canDownload =
    reportType === 'member'
      ? !!memberFilter
      : !!startDate && !!endDate;

  const handleDownload = async () => {
    if (!canDownload) return;
    setDownloading(true);
    try {
      let res: any;
      if (reportType === 'member') {
        res = await downloadMemberExcelAPI(memberFilter, fileType);
      } else {
        res = await downloadMemberBillsAPI({ startDate, endDate, fileType });
      }
      const fileName = res?.data?.fileName ?? res?.fileName;
      if (fileName) {
        window.open(fileName, '_blank');
        setToast({ message: 'Download started', severity: 'success' });
      } else {
        setToast({ message: 'No file returned from server', severity: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to download report', severity: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/reports')} size="small">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Download Report
        </Typography>
      </Box>

      {/* Info card */}
      <Card sx={{ mb: 3, bgcolor: `${Colors.primary}08`, borderLeft: `4px solid ${Colors.primary}` }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="body2" fontWeight={600} mb={0.5}>
            Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The report will be generated and downloaded as a file. Member reports include all member details for the selected filter. Bill reports include invoices for the selected date range.
          </Typography>
        </CardContent>
      </Card>

      {/* Builder card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          {/* Report Type Toggle */}
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Report Type
          </Typography>
          <ToggleButtonGroup
            value={reportType}
            exclusive
            onChange={(_, v) => v && setReportType(v)}
            sx={{ mb: 3 }}
            fullWidth
          >
            <ToggleButton value="member" sx={{ textTransform: 'none', fontWeight: 600 }}>
              Member Report
            </ToggleButton>
            <ToggleButton value="bill" sx={{ textTransform: 'none', fontWeight: 600 }}>
              Bills / Invoices
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider sx={{ mb: 3 }} />

          {/* Member filter or date range */}
          {reportType === 'member' ? (
            <FormControl fullWidth>
              <InputLabel>Select Report Filter *</InputLabel>
              <Select
                value={memberFilter}
                label="Select Report Filter *"
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                {MEMBER_FILTERS.map((f) => (
                  <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          )}

          {/* File type */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              File Format
            </Typography>
            <ToggleButtonGroup
              value={fileType}
              exclusive
              onChange={(_, v) => v && setFileType(v)}
              size="small"
            >
              <ToggleButton value="excel" sx={{ textTransform: 'none', px: 3 }}>
                Excel
              </ToggleButton>
              <ToggleButton value="pdf" sx={{ textTransform: 'none', px: 3 }}>
                PDF
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {/* Download action */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<DownloadIcon />}
        disabled={!canDownload || downloading}
        onClick={handleDownload}
        sx={{ py: 1.5, fontWeight: 600, fontSize: 15 }}
      >
        {downloading ? 'Downloading...' : `Download ${fileType.toUpperCase()}`}
      </Button>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled">
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
