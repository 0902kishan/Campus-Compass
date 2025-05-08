"use client";

import * as React from 'react';

/**
 * A component that visually hides its children while keeping them accessible to screen readers.
 * Based on Radix UI's VisuallyHidden primitive.
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      ref={ref}
      style={{
        position: 'absolute',
        border: 0,
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
      }}
      {...props}
    />
  );
});
VisuallyHidden.displayName = 'VisuallyHidden';

// Radix UI's Slot component is used to allow `asChild` prop functionality.
// If not already available or causing issues, this basic span implementation can be simplified.
// For this implementation, we'll assume Slot might be needed if 'asChild' is to be fully supported.
// A simpler version without `asChild` would just use `span`.

// Simplified version without Slot, if Slot is not readily available or desired:
// export const VisuallyHidden = React.forwardRef<
//   HTMLSpanElement,
//   React.HTMLAttributes<HTMLSpanElement>
// >((props, ref) => {
//   return (
//     <span
//       ref={ref}
//       style={{
//         position: 'absolute',
//         border: 0,
//         width: 1,
//         height: 1,
//         padding: 0,
//         margin: -1,
//         overflow: 'hidden',
//         clip: 'rect(0, 0, 0, 0)',
//         whiteSpace: 'nowrap',
//         wordWrap: 'normal',
//       }}
//       {...props}
//     />
//   );
// });
// VisuallyHidden.displayName = 'VisuallyHidden';

// Using Slot for `asChild` compatibility, assuming Slot is available or can be imported.
// If Slot is not part of the project's Radix setup directly, we might need to import it or simplify.
// For shadcn/ui, Slot is typically available from "@radix-ui/react-slot".

import { Slot } from "@radix-ui/react-slot"
