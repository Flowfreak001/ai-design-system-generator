"use client";

import React from "react";
// Repo standardizes on framer-motion (v12); "motion/react" from the upstream
// snippet is the same API surface.
import { motion, useReducedMotion } from "framer-motion";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  const reduce = useReducedMotion();
  return (
    <div className={props.className}>
      <motion.div
        animate={reduce ? undefined : { translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2).fill(0)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="w-full max-w-xs rounded-3xl border border-line bg-surface p-8 shadow-[0_10px_40px_-16px_rgba(8,9,10,0.12)]"
                key={i}
              >
                <p className="text-[15px] leading-relaxed text-body">{text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium leading-5 tracking-tight text-ink">{name}</div>
                    <div className="text-[13px] leading-5 tracking-tight text-muted">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
