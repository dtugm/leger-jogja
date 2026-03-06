declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "cesium/Build/Cesium/Widgets/widgets.css";
