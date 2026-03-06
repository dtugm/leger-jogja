import React from "react";

import { NavbarActions } from "./NavbarActions";
import { NavbarLogo } from "./NavbarLogo";

const Navbar: React.FC = () => {
  return (
    <nav className="sticky flex items-center justify-between px-6 py-3 bg-navbar-bg shadow-[0px_1px_2px_-1px_var(--navbar-shadow),0px_1px_3px_0px_var(--navbar-shadow)] z-10">
      <NavbarLogo />
      <NavbarActions />
    </nav>
  );
};

export default Navbar;
