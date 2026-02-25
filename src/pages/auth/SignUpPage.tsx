import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { FitnessCenter as GymIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { checkEmailExistAPI, signUpAPI } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  subName: z.string().min(1, 'Gym name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobile: z.string().min(1, 'Mobile number is required'),
  callingCode: z.string().default('91'),
  countryCode: z.string().default('in'),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      callingCode: '91',
      countryCode: 'in',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError('');
    setLoading(true);
    try {
      // Check if email already exists
      const emailCheck = await checkEmailExistAPI({ email: data.email });
      if (emailCheck.isUserExist) {
        setError('An account with this email already exists. Please sign in.');
        setLoading(false);
        return;
      }

      const res = await signUpAPI({
        ...data,
        referBy: '',
      });
      await login(res.authToken);
      navigate('/');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <GymIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary" fontWeight={700}>
              GymBook
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Create your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Your Name"
              fullWidth
              margin="normal"
              autoComplete="name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Gym Name"
              fullWidth
              margin="normal"
              {...register('subName')}
              error={!!errors.subName}
              helperText={errors.subName?.message}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              autoComplete="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Mobile Number"
              fullWidth
              margin="normal"
              autoComplete="tel"
              {...register('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              autoComplete="new-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" mt={2}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
