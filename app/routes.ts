import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('./routes/Home.tsx'),
  route('explore', './routes/Explore.tsx'),
  route('programs/:id', './routes/Program.tsx'),
  route('starred', './routes/Starred.tsx'),
  route('account', './routes/AccountRedirect.tsx'),
  route('account/notifications', './routes/Notifications.tsx'),
  route('account/edit-profile', './routes/EditProfile.tsx'),
  route('account/change-password', './routes/ChangePassword.tsx'),
  route('sign-in', './routes/SignIn.tsx'),
  route('sign-up', './routes/SignUp.tsx'),
  route('about-us', './routes/AboutUs.tsx'),
  route('terms-and-conditions', './routes/TermsAndConditions.tsx'),
  route('privacy-policy', './routes/PrivacyPolicy.tsx'),
] satisfies RouteConfig;
