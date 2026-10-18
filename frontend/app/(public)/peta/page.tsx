import * as React from "react";
import { GoogleMapsView } from "@/components/maps/google-maps-view";

export default function PetaRoutePage() {
  return (
    <div className="w-full h-full overflow-hidden">
      <GoogleMapsView showMobileNav={true} />
    </div>
  );
}
