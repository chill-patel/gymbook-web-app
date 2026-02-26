import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  OndemandVideo as VideoIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Layout } from '@/theme';

const WHATSAPP_NUMBER = '8169102340';
const EMAIL_ADDRESS = 'help@gymbook.in';
const VIDEO_TUTORIAL_URL = 'https://learn.gymbook.in';

export default function HelpPage() {
  const { gym } = useAuth();
  const email = gym?.admin?.email ?? gym?.email ?? '';

  const openWhatsApp = () => {
    const message = `Hi, I need help with GymBook.${email ? ` My email is ${email}.` : ''}`;
    window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidthNarrow, mx: 'auto' }}>
      <PageHeader title="Help & Support" backPath={true} />

      {/* Video Tutorials */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Video Tutorials
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Watch step-by-step video guides to learn how to use GymBook effectively.
          </Typography>
          <Button
            variant="contained"
            startIcon={<VideoIcon />}
            onClick={() => window.open(VIDEO_TUTORIAL_URL, '_blank')}
            sx={{ fontWeight: 600 }}
          >
            Watch Tutorials
          </Button>
        </CardContent>
      </Card>

      {/* Chat Support */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Chat Support
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Get instant help by chatting with our support team on WhatsApp.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            onClick={openWhatsApp}
            sx={{ fontWeight: 600, color: '#25D366', borderColor: '#25D366', '&:hover': { borderColor: '#1DA851', bgcolor: 'rgba(37, 211, 102, 0.04)' } }}
          >
            WhatsApp Chat
          </Button>
        </CardContent>
      </Card>

      {/* Contact Us */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Contact Us
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Phone: +91 {WHATSAPP_NUMBER}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Email: {EMAIL_ADDRESS}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<PhoneIcon />}
              onClick={() => window.open(`tel:+91${WHATSAPP_NUMBER}`, '_self')}
              sx={{ fontWeight: 600 }}
            >
              Call Now
            </Button>
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={() => window.open(`mailto:${EMAIL_ADDRESS}`, '_self')}
              sx={{ fontWeight: 600 }}
            >
              Email Us
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
