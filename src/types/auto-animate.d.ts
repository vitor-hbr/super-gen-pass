declare module "@formkit/auto-animate" {
  export default function autoAnimate(
    element: Element,
    config?: {
      duration?: number;
      easing?: string;
      disrespectUserMotionPreference?: boolean;
    },
  ): void;
}
