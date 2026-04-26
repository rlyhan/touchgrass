import {
  Atom,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  Camera,
  ChefHat,
  Clock,
  Code,
  Coffee,
  Drama,
  Drum,
  Dumbbell,
  Feather,
  Film,
  FlaskConical,
  Footprints,
  Gamepad,
  Globe,
  Guitar,
  Hammer,
  Heart,
  Laptop,
  Leaf,
  Lightbulb,
  Mic,
  Microscope,
  Mountain,
  Music,
  Notebook,
  Paintbrush,
  Palette,
  Pen,
  Sparkle,
  Sprout,
  Sword,
  Target,
  Telescope,
  Theater,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react-native"

export type RecommendationType =
  | "Constructive"
  | "Active"
  | "Artistic"
  | "Intellectual"
  | "Outdoorsy"
  | "Social"
  | "Reflective"
  | "Creative"
  | "Adventurous"
  | "Professional"

export type RecommendationField =
  | "Music"
  | "Martial Arts"
  | "Literature"
  | "Cooking"
  | "Photography"
  | "Gaming"
  | "Fitness"
  | "Coding"
  | "Science"
  | "Nature"
  | "Film"
  | "Theater"
  | "Visual Art"
  | "Writing"
  | "Dance"
  | "Cycling"
  | "Hiking"
  | "Travel"
  | "Wellness"
  | "Astronomy"

const TYPE_ICONS: Record<RecommendationType, LucideIcon> = {
  Constructive: Wrench,
  Active: Dumbbell,
  Artistic: Palette,
  Intellectual: Brain,
  Outdoorsy: Mountain,
  Social: Users,
  Reflective: Feather,
  Creative: Sparkle,
  Adventurous: Footprints,
  Professional: Briefcase,
}

const FIELD_ICONS: Record<RecommendationField, LucideIcon> = {
  Music: Guitar,
  "Martial Arts": Sword,
  Literature: BookOpen,
  Cooking: ChefHat,
  Photography: Camera,
  Gaming: Gamepad,
  Fitness: Dumbbell,
  Coding: Code,
  Science: FlaskConical,
  Nature: Leaf,
  Film: Film,
  Theater: Drama,
  "Visual Art": Paintbrush,
  Writing: Pen,
  Dance: Theater,
  Cycling: Bike,
  Hiking: Mountain,
  Travel: Globe,
  Wellness: Heart,
  Astronomy: Telescope,
}

// Fallbacks ensure unknown labels still render a sensible icon rather than nothing.
export function getTypeIcon(type: string): LucideIcon {
  return TYPE_ICONS[type as RecommendationType] ?? Sparkle
}

export function getFieldIcon(field: string): LucideIcon {
  return FIELD_ICONS[field as RecommendationField] ?? Target
}

export const TimeIcon: LucideIcon = Clock

// Re-export the full icon set so callers can extend mappings without re-importing from lucide.
export const RecommendationIcons = {
  Atom,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  Camera,
  ChefHat,
  Clock,
  Code,
  Coffee,
  Drama,
  Drum,
  Dumbbell,
  Feather,
  Film,
  FlaskConical,
  Footprints,
  Gamepad,
  Globe,
  Guitar,
  Hammer,
  Heart,
  Laptop,
  Leaf,
  Lightbulb,
  Mic,
  Microscope,
  Mountain,
  Music,
  Notebook,
  Paintbrush,
  Palette,
  Pen,
  Sparkle,
  Sprout,
  Sword,
  Target,
  Telescope,
  Theater,
  Trophy,
  Users,
  Wrench,
}
