import React from "react";

import { NavbarActions } from "./NavbarActions";
import { NavbarLogo } from "./NavbarLogo";

const Navbar: React.FC = () => {
  return (
    <nav className="sticky bg-navbar-bg shadow-[0px_1px_2px_-1px_var(--navbar-shadow),0px_1px_3px_0px_var(--navbar-shadow)] z-10">
      <div className="mx-auto w-[90%] xl:max-w-[80%] flex items-center justify-between py-3">
        <NavbarLogo />
        <NavbarActions />
      </div>
    </nav>
  );
};

export default Navbar;
