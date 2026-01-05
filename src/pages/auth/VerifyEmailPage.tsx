import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { verifyEmail, resendVerification, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);
  
  const email = location.state?.email || user?.email || '';
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  // Simulate auto-verification for demo
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      dispatch(verifyEmail(token)).then((result) => {
        if (verifyEmail.fulfilled.match(result)) {
          setVerified(true);
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      });
    }
  }, [location.search, dispatch, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    await dispatch(resendVerification(email));
    setResendCooldown(60);
  };

  // For demo: simulate verification
  const handleSimulateVerify = async () => {
    const result = await dispatch(verifyEmail('demo-token'));
    if (verifyEmail.fulfilled.match(result)) {
      setVerified(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Email verified!</h2>
              <p className="text-muted-foreground">
                Redirecting you to the dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a verification link to{' '}
                <strong className="text-foreground">{email || 'your email'}</strong>
              </p>

              {error && (
                <Alert variant="destructive" className="mb-4 text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {/* Demo button to simulate verification */}
                <Button onClick={handleSimulateVerify} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email (Demo)'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
                </Button>

                <p className="text-xs text-muted-foreground pt-2">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
