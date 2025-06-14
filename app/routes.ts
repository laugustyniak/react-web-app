import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('./routes/Home.tsx'),
  route('explore', './routes/Explore.tsx'),
  route('inspirations/:id', './routes/Inspiration.tsx'),
  route('programs/:id', './routes/Program.tsx'),
  route('products/:id', './routes/Product.tsx'),
  route('starred', './routes/Starred.tsx'),
  route('generate-inspiration', './routes/Canvas.tsx'),
  route('video-frame-extraction', './routes/VideoFrameExtraction.tsx'),
  route('product-extraction', './routes/ProductExtraction.tsx'),
  route('account', './routes/AccountRedirect.tsx'),
  route('account/edit-profile', './routes/EditProfile.tsx'),
  route('account/change-password', './routes/ChangePassword.tsx'),
  route('sign-in', './routes/SignIn.tsx'),
  route('sign-up', './routes/SignUp.tsx'),
  route('reset-password', './routes/ResetPassword.tsx'),
] satisfies RouteConfig;
