import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Mail, ShieldCheck, Truck, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthResult {
  user: Partial<UserProfile>;
  token?: string;
}

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: 'popup' | 'redirect';
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface LoginViewProps {
  onLoginSuccess: (profile: Partial<UserProfile>, token?: string) => void | Promise<void>;
  onSignIn?: (email: string, password: string) => Promise<AuthResult>;
  onGoogleSignIn?: (idToken: string) => Promise<AuthResult>;
  onSignUp?: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResult>;
  onForgotPassword?: (email: string) => Promise<unknown>;
  onCompletePhone?: (phone: string, profile: Partial<UserProfile>) => Promise<Partial<UserProfile>>;
  googleClientId?: string;
  intent?: 'account' | 'checkout';
  onBack?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'phone';
type AuthStatus = 'idle' | 'authenticating' | 'success';

const CHECKOUT_POINTS = [
  { icon: ShieldCheck, label: 'Secure sign-in', text: 'Keep addresses and order history saved.' },
  { icon: CreditCard, label: 'India payments', text: 'UPI, RuPay and cards supported.' },
  { icon: Truck, label: 'Fast dispatch', text: 'Blue Dart and Delhivery enabled.' }
];

const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleIdentity = () => new Promise<boolean>((resolve) => {
  if (window.google?.accounts?.id) {
    resolve(true);
    return;
  }

  const finish = (ok: boolean) => resolve(ok && Boolean(window.google?.accounts?.id));
  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

  if (existingScript) {
    if (window.google?.accounts?.id) {
      resolve(true);
      return;
    }

    let settled = false;
    const complete = (ok: boolean) => {
      if (settled) return;
      settled = true;
      finish(ok);
    };

    existingScript.addEventListener('load', () => complete(true), { once: true });
    existingScript.addEventListener('error', () => complete(false), { once: true });
    window.setTimeout(() => complete(Boolean(window.google?.accounts?.id)), 1500);
    return;
  }

  const script = document.createElement('script');
  script.id = GOOGLE_SCRIPT_ID;
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => finish(true);
  script.onerror = () => finish(false);
  document.head.appendChild(script);
});

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onSignIn,
  onGoogleSignIn,
  onSignUp,
  onForgotPassword,
  onCompletePhone,
  googleClientId = '',
  intent = 'account',
  onBack
}) => {
  const [mode, setMode] = React.useState<AuthMode>('signin');
  const [status, setStatus] = React.useState<AuthStatus>('idle');
  const [feedbackMsg, setFeedbackMsg] = React.useState('');
  const googleButtonRef = React.useRef<HTMLDivElement | null>(null);

  const [signInEmail, setSignInEmail] = React.useState('');
  const [signInPassword, setSignInPassword] = React.useState('');
  const [signUpFirstName, setSignUpFirstName] = React.useState('');
  const [signUpLastName, setSignUpLastName] = React.useState('');
  const [signUpEmail, setSignUpEmail] = React.useState('');
  const [signUpPhone, setSignUpPhone] = React.useState('');
  const [signUpPassword, setSignUpPassword] = React.useState('');
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [phoneCompletionValue, setPhoneCompletionValue] = React.useState('');
  const [pendingAuthSession, setPendingAuthSession] = React.useState<AuthResult | null>(null);

  const isCheckout = intent === 'checkout';

  const finishAuth = React.useCallback((profile: Partial<UserProfile>, token?: string) => {
    setStatus('success');
    setFeedbackMsg(isCheckout ? 'RETURNING TO CHECKOUT' : 'ACCOUNT READY');
    window.setTimeout(async () => {
      await onLoginSuccess(profile, token);
      setStatus('idle');
      setFeedbackMsg('');
    }, 650);
  }, [isCheckout, onLoginSuccess]);

  const continueWithSession = React.useCallback((session: AuthResult) => {
    if (!session.user.phone?.trim() && onCompletePhone) {
      setPendingAuthSession(session);
      setPhoneCompletionValue('');
      setMode('phone');
      setStatus('idle');
      setFeedbackMsg('PHONE NUMBER REQUIRED');
      return;
    }

    finishAuth(session.user, session.token);
  }, [finishAuth, onCompletePhone]);

  const handleGoogleCredential = React.useCallback(async (idToken: string) => {
    if (!onGoogleSignIn) return;

    setStatus('authenticating');
    setFeedbackMsg('VERIFYING GOOGLE');

    try {
      const session = await onGoogleSignIn(idToken);
      continueWithSession(session);
    } catch (error) {
      setStatus('idle');
      setFeedbackMsg(error instanceof Error ? error.message : 'GOOGLE SIGN IN FAILED');
    }
  }, [continueWithSession, onGoogleSignIn]);

  React.useEffect(() => {
    const target = googleButtonRef.current;
    if (!target || mode === 'forgot' || mode === 'phone' || !googleClientId || !onGoogleSignIn) return;

    let cancelled = false;
    target.innerHTML = '';

    loadGoogleIdentity().then((loaded) => {
      if (cancelled || !loaded || !window.google?.accounts?.id || !target) {
        if (!cancelled && googleClientId) setFeedbackMsg('GOOGLE SIGN IN COULD NOT LOAD');
        return;
      }

      target.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) {
            void handleGoogleCredential(response.credential);
            return;
          }

          setStatus('idle');
          setFeedbackMsg('GOOGLE SIGN IN CANCELLED');
        },
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true
      });

      window.google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        logo_alignment: 'center',
        width: Math.min(420, target.clientWidth || 360)
      });
    });

    return () => {
      cancelled = true;
      target.innerHTML = '';
    };
  }, [googleClientId, handleGoogleCredential, mode, onGoogleSignIn]);

  const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signInEmail || !signInPassword) return;

    setStatus('authenticating');
    setFeedbackMsg('VERIFYING DETAILS');

    try {
      if (onSignIn) {
        const session = await onSignIn(signInEmail, signInPassword);
        continueWithSession(session);
        return;
      }

      const localName = signInEmail.split('@')[0].split(/[._-]/)[0] || 'Story';
      finishAuth({
        firstName: localName.charAt(0).toUpperCase() + localName.slice(1),
        lastName: 'Client',
        email: signInEmail
      });
    } catch (error) {
      setStatus('idle');
      setFeedbackMsg(error instanceof Error ? error.message : 'SIGN IN FAILED');
    }
  };

  const handleSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signUpFirstName || !signUpLastName || !signUpEmail || !signUpPhone || !signUpPassword) return;

    setStatus('authenticating');
    setFeedbackMsg('CREATING PROFILE');

    try {
      if (onSignUp) {
        const session = await onSignUp({
          firstName: signUpFirstName,
          lastName: signUpLastName,
          email: signUpEmail,
          phone: signUpPhone,
          password: signUpPassword
        });
        continueWithSession(session);
        return;
      }

      continueWithSession({
        user: {
        firstName: signUpFirstName,
        lastName: signUpLastName,
        email: signUpEmail,
        phone: signUpPhone
        }
      });
    } catch (error) {
      setStatus('idle');
      setFeedbackMsg(error instanceof Error ? error.message : 'ACCOUNT CREATION FAILED');
    }
  };

  const handlePhoneCompletionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phoneCompletionValue.trim() || !pendingAuthSession) return;

    setStatus('authenticating');
    setFeedbackMsg('SAVING PHONE');

    try {
      const updatedProfile = onCompletePhone
        ? await onCompletePhone(phoneCompletionValue.trim(), pendingAuthSession.user)
        : { ...pendingAuthSession.user, phone: phoneCompletionValue.trim() };
      setPendingAuthSession(null);
      finishAuth({ ...pendingAuthSession.user, ...updatedProfile, phone: phoneCompletionValue.trim() }, pendingAuthSession.token);
    } catch (error) {
      setStatus('idle');
      setFeedbackMsg(error instanceof Error ? error.message : 'PHONE UPDATE FAILED');
    }
  };

  const handleForgotSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!forgotEmail) return;

    setStatus('authenticating');
    setFeedbackMsg('SENDING RECOVERY LINK');
    try {
      if (onForgotPassword) await onForgotPassword(forgotEmail);
      setStatus('success');
      setFeedbackMsg('CHECK YOUR EMAIL');
      window.setTimeout(() => {
        setMode('signin');
        setStatus('idle');
        setFeedbackMsg('');
      }, 1200);
    } catch (error) {
      setStatus('idle');
      setFeedbackMsg(error instanceof Error ? error.message : 'RECOVERY FAILED');
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setStatus('idle');
    setFeedbackMsg('');
    setPendingAuthSession(null);
    setMode(nextMode);
  };

  const submitLabel = isCheckout ? 'SIGN IN AND REVIEW ORDER' : 'SIGN IN';
  const signupLabel = isCheckout ? 'CREATE ACCOUNT AND REVIEW ORDER' : 'CREATE ACCOUNT';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-[calc(100vh-5rem)] bg-[#fafafa] text-[#111111]"
      id="login-view-root"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden border-b border-[#deded9] bg-[#e9e9e6] lg:block lg:min-h-[calc(100vh-5rem)] lg:border-b-0 lg:border-r">
          <img
            alt="STORY India client access editorial"
            className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="font-mono text-[9px] uppercase text-neutral-300">STORY INDIA</p>
            <p className="mt-2 max-w-sm text-2xl font-semibold uppercase leading-tight">
              {isCheckout ? 'Secure your order without losing your selection.' : 'Access your private wardrobe profile.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-0">
          <div className="w-full max-w-xl">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase text-[#6f6f6f] transition hover:text-[#111111]"
              >
                <ArrowLeft size={13} strokeWidth={1.6} />
                {isCheckout ? 'Back to bag' : 'Back'}
              </button>
            )}

            <div className="mb-6">
              <p className="font-mono text-[10px] uppercase text-[#6f6f6f]">
                {isCheckout ? 'Checkout access' : 'Account access'}
              </p>
              <h1 className="mt-2 font-display text-3xl font-black uppercase leading-none text-[#050505] sm:text-4xl lg:text-5xl">
                {mode === 'phone' ? 'Add Phone' : mode === 'forgot' ? 'Recover Access' : isCheckout ? 'Continue Securely' : 'Sign In'}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#555555]">
                {mode === 'phone'
                  ? 'Add a phone number so delivery updates and order calls can reach you.'
                  : isCheckout
                  ? 'Sign in to complete secure Razorpay checkout.'
                  : 'Access your profile, addresses, and order history.'}
              </p>
            </div>

            {isCheckout && (
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {CHECKOUT_POINTS.map(({ icon: Icon, label, text }) => (
                  <div key={label} className="border border-[#deded9] bg-white p-4">
                    <Icon size={16} strokeWidth={1.5} />
                    <p className="mt-3 font-mono text-[9px] uppercase text-[#111111]">{label}</p>
                    <p className="mt-2 text-xs leading-5 text-[#666660]">{text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border border-[#111111] bg-white p-6 sm:p-8">
              {feedbackMsg && status === 'idle' && (
                <div className="mb-5 border border-[#111111] bg-[#fafafa] px-4 py-3 font-mono text-[9px] uppercase text-[#111111]">
                  {feedbackMsg}
                </div>
              )}

              <AnimatePresence mode="wait">
                {mode === 'signin' && (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSignInSubmit}
                    className="space-y-6"
                    id="signin-interactive-form"
                  >
                    <AuthField label="Email address">
                      <input
                        id="email-input"
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        value={signInEmail}
                        onChange={(event) => setSignInEmail(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <AuthField
                      label="Password"
                      action={(
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="font-mono text-[9px] uppercase text-[#6f6f6f] transition hover:text-[#111111]"
                        >
                          Forgot?
                        </button>
                      )}
                    >
                      <input
                        id="pass-input"
                        type="password"
                        required
                        placeholder="Password"
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        value={signInPassword}
                        onChange={(event) => setSignInPassword(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <SubmitButton status={status} idleLabel={submitLabel} feedbackMsg={feedbackMsg} />
                  </motion.form>
                )}

                {mode === 'signup' && (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSignUpSubmit}
                    className="space-y-5"
                    id="signup-interactive-form"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <AuthField label="First name">
                        <input
                          id="first-input"
                          required
                          className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                          placeholder="First name"
                          value={signUpFirstName}
                          onChange={(event) => setSignUpFirstName(event.target.value)}
                          disabled={status !== 'idle'}
                        />
                      </AuthField>
                      <AuthField label="Last name">
                        <input
                          id="last-input"
                          required
                          className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                          placeholder="Last name"
                          value={signUpLastName}
                          onChange={(event) => setSignUpLastName(event.target.value)}
                          disabled={status !== 'idle'}
                        />
                      </AuthField>
                    </div>

                    <AuthField label="Email address">
                      <input
                        id="reg-email"
                        type="email"
                        required
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        placeholder="name@example.com"
                        value={signUpEmail}
                        onChange={(event) => setSignUpEmail(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <AuthField label="Phone">
                      <input
                        id="reg-phone"
                        required
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        placeholder="+91"
                        value={signUpPhone}
                        onChange={(event) => setSignUpPhone(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <AuthField label="Password">
                      <input
                        id="reg-password"
                        type="password"
                        required
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        placeholder="Create a password"
                        value={signUpPassword}
                        onChange={(event) => setSignUpPassword(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <SubmitButton status={status} idleLabel={signupLabel} feedbackMsg={feedbackMsg} icon="signup" />
                  </motion.form>
                )}

                {mode === 'phone' && (
                  <motion.form
                    key="phone"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handlePhoneCompletionSubmit}
                    className="space-y-6"
                    id="phone-completion-form"
                  >
                    <div className="border border-[#deded9] bg-[#fafafa] p-4 text-xs leading-5 text-[#555555]">
                      Phone number is required before checkout and account creation can continue.
                    </div>

                    <AuthField label="Phone number">
                      <input
                        id="phone-completion-input"
                        required
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        placeholder="+91"
                        value={phoneCompletionValue}
                        onChange={(event) => setPhoneCompletionValue(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <SubmitButton status={status} idleLabel="SAVE PHONE AND CONTINUE" feedbackMsg={feedbackMsg} />
                  </motion.form>
                )}

                {mode === 'forgot' && (
                  <motion.form
                    key="forgot"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleForgotSubmit}
                    className="space-y-6"
                    id="forgot-interactive-form"
                  >
                    <div className="border border-[#deded9] bg-[#fafafa] p-4 text-xs leading-5 text-[#555555]">
                      Enter the email linked to your STORY India account. We will send a secure recovery link.
                    </div>

                    <AuthField label="Email address">
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        className="w-full bg-transparent py-2 text-sm text-[#111111] placeholder:text-[#9a9a95]"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        disabled={status !== 'idle'}
                      />
                    </AuthField>

                    <SubmitButton status={status} idleLabel="SEND RECOVERY LINK" feedbackMsg={feedbackMsg} icon="mail" />

                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="w-full border border-[#deded9] bg-white py-3.5 font-mono text-[10px] uppercase text-[#111111] transition hover:border-[#111111]"
                    >
                      Back to sign in
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {mode !== 'forgot' && mode !== 'phone' && googleClientId && onGoogleSignIn && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#deded9]" />
                    <span className="font-mono text-[9px] uppercase text-[#777777]">or</span>
                    <span className="h-px flex-1 bg-[#deded9]" />
                  </div>
                  <div className={status === 'idle' ? '' : 'pointer-events-none opacity-60'}>
                    <div ref={googleButtonRef} className="flex min-h-11 justify-center" />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && mode !== 'phone' && (
                <div className="mt-8 space-y-4 border-t border-[#deded9] pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-[#666660]">
                      {mode === 'signin' ? 'New to STORY India?' : 'Already registered?'}
                    </span>
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                      className="font-mono text-[10px] font-semibold uppercase text-[#111111] underline-offset-4 hover:underline"
                      id="toggle-auth-mode-btn"
                    >
                      {mode === 'signin' ? 'Create account' : 'Sign in'}
                    </button>
                  </div>
                  {isCheckout && (
                    <p className="border border-[#deded9] bg-[#fafafa] px-4 py-3 font-mono text-[9px] uppercase leading-relaxed text-[#666660]">
                      Checkout requires a STORY India account so delivery, payment, returns, and order tracking stay connected.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function AuthField({
  label,
  action,
  children
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block border-b border-[#111111] pb-1">
      <span className="flex items-center justify-between gap-4">
        <span className="font-mono text-[9px] font-semibold uppercase text-[#6f6f6f]">{label}</span>
        {action}
      </span>
      {children}
    </label>
  );
}

function SubmitButton({
  status,
  idleLabel,
  feedbackMsg,
  icon
}: {
  status: AuthStatus;
  idleLabel: string;
  feedbackMsg: string;
  icon?: 'signup' | 'mail';
}) {
  const IdleIcon = icon === 'signup' ? UserPlus : icon === 'mail' ? Mail : ArrowRight;

  return (
    <button
      type="submit"
      disabled={status !== 'idle'}
      className="inline-flex w-full items-center justify-center gap-2 bg-[#111111] px-6 py-4 font-mono text-[10px] font-semibold uppercase text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-80"
    >
      {status === 'idle' && (
        <>
          <span>{idleLabel}</span>
          <IdleIcon size={14} strokeWidth={1.6} />
        </>
      )}
      {status === 'authenticating' && <span>{feedbackMsg}</span>}
      {status === 'success' && (
        <>
          <Check size={14} strokeWidth={1.6} />
          <span>{feedbackMsg}</span>
        </>
      )}
    </button>
  );
}
