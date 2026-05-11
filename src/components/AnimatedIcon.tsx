import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AnimatedIconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
  animation?: 'pulse' | 'spin' | 'bounce' | 'breath' | 'blink' | 'alert';
  color?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  name,
  size = 48,
  className,
  animation,
  color,
}) => {
  const IconComponent = Icons[name] as React.ElementType;

  if (!IconComponent) return null;

  const variants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 2 },
    },
    spin: {
      rotate: [0, 360],
      transition: { repeat: Infinity, duration: 4, ease: "linear" },
    },
    bounce: {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 1.5 },
    },
    breath: {
      scale: [1, 1.3, 1],
      opacity: [0.6, 1, 0.6],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
    },
    blink: {
      opacity: [1, 0.5, 1],
      transition: { repeat: Infinity, duration: 2 },
    },
    alert: {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      animate={animation ? variants[animation] : {}}
      className={cn("flex items-center justify-center", className)}
      style={{ color }}
    >
      <IconComponent size={size} />
    </motion.div>
  );
};
