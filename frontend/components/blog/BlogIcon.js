import {
  Stethoscope,
  Calculator,
  Scale,
  QrCode,
  MessageCircle,
  Target,
  Sparkles,
  GraduationCap,
  BookOpen,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const ICON_MAP = {
  Stethoscope,
  Calculator,
  Scale,
  QrCode,
  MessageCircle,
  Target,
  Sparkles,
  GraduationCap,
  BookOpen,
  User,
  ShieldCheck,
  TrendingUp,
};

export default function BlogIcon({ name, className = 'w-6 h-6' }) {
  const IconComponent = ICON_MAP[name] || BookOpen;
  return <IconComponent className={className} />;
}
