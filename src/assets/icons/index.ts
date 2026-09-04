export type { IconProps } from "./types";
export { Blade } from "./blade";
export { CaretDown } from "./caret-down";
export { CaretUp } from "./caret-up";
export { Check } from "./check";
export { Checker } from "./checker";
export { Close } from "./close";
export { Collapse } from "./collapse";
export { CollapseDown } from "./collapse-down";
export { Contrast } from "./contrast";
export { Copy } from "./copy";
export { Cursor } from "./cursor";
export { Expand } from "./expand";
export { ExpandUp } from "./expand-up";
export { Eye } from "./eye";
export { EyeOff } from "./eye-off";
export { FastForward } from "./fast-forward";
export { Film } from "./film";
export { Fx } from "./fx";
export { Image } from "./image";
export { Info } from "./info";
export { Lock } from "./lock";
export { Logo } from "./logo";
export { MediaReplace } from "./media-replace";
export { Minus } from "./minus";
export { MoreDots } from "./more-dots";
export { Music } from "./music";
export { Next } from "./next";
export { Opacity } from "./opacity";
export { Pause } from "./pause";
export { Play } from "./play";
export { Plus } from "./plus";
export { Previous } from "./previous";
export { Redo } from "./redo";
export { Reset } from "./reset";
export { Rewind } from "./rewind";
export { Rotate } from "./rotate";
export { Search } from "./search";
export { ShapeArrow } from "./shape-arrow";
export { ShapeCircle } from "./shape-circle";
export { ShapeLine } from "./shape-line";
export { ShapeSquare } from "./shape-square";
export { ShapeStar } from "./shape-star";
export { ShapeTriangle } from "./shape-triangle";
export { TextAlignCenter } from "./text-align-center";
export { TextAlignLeft } from "./text-align-left";
export { TextAlignRight } from "./text-align-right";
export { Trash } from "./trash";
export { Type } from "./type";
export { Undo } from "./undo";
export { Unlock } from "./unlock";
export { Volume } from "./volume";
export { VolumeLow } from "./volume-low";
export { VolumeMute } from "./volume-mute";
export { Warning } from "./warning";
import { Blade } from "./blade";
import { CaretDown } from "./caret-down";
import { CaretUp } from "./caret-up";
import { Check } from "./check";
import { Checker } from "./checker";
import { Close } from "./close";
import { Collapse } from "./collapse";
import { CollapseDown } from "./collapse-down";
import { Contrast } from "./contrast";
import { Copy } from "./copy";
import { Cursor } from "./cursor";
import { Expand } from "./expand";
import { ExpandUp } from "./expand-up";
import { Eye } from "./eye";
import { EyeOff } from "./eye-off";
import { FastForward } from "./fast-forward";
import { Film } from "./film";
import { Fx } from "./fx";
import { Image } from "./image";
import { Info } from "./info";
import { Lock } from "./lock";
import { Logo } from "./logo";
import { MediaReplace } from "./media-replace";
import { Minus } from "./minus";
import { MoreDots } from "./more-dots";
import { Music } from "./music";
import { Next } from "./next";
import { Opacity } from "./opacity";
import { Pause } from "./pause";
import { Play } from "./play";
import { Plus } from "./plus";
import { Previous } from "./previous";
import { Redo } from "./redo";
import { Reset } from "./reset";
import { Rewind } from "./rewind";
import { Rotate } from "./rotate";
import { Search } from "./search";
import { ShapeArrow } from "./shape-arrow";
import { ShapeCircle } from "./shape-circle";
import { ShapeLine } from "./shape-line";
import { ShapeSquare } from "./shape-square";
import { ShapeStar } from "./shape-star";
import { ShapeTriangle } from "./shape-triangle";
import { TextAlignCenter } from "./text-align-center";
import { TextAlignLeft } from "./text-align-left";
import { TextAlignRight } from "./text-align-right";
import { Trash } from "./trash";
import { Type } from "./type";
import { Undo } from "./undo";
import { Unlock } from "./unlock";
import { Volume } from "./volume";
import { VolumeLow } from "./volume-low";
import { VolumeMute } from "./volume-mute";
import { Warning } from "./warning";
import type { ComponentType } from "react";
import type { IconProps } from "./types";
export const iconById: Record<string, ComponentType<IconProps>> = {
  "i-plus": Plus,
  "i-minus": Minus,
  "i-x": Close,
  "i-check": Check,
  "i-search": Search,
  "i-info": Info,
  "i-warn": Warning,
  "i-trash": Trash,
  "i-copy": Copy,
  "i-dots": MoreDots,
  "i-logo": Logo,
  "i-cursor": Cursor,
  "i-blade": Blade,
  "i-fx": Fx,
  "i-image": Image,
  "i-music": Music,
  "i-film": Film,
  "i-m-media": MediaReplace,
  "i-caret": CaretDown,
  "i-caret-up": CaretUp,
  "i-undo": Undo,
  "i-redo": Redo,
  "i-reset": Reset,
  "i-play": Play,
  "i-pause": Pause,
  "i-prev": Previous,
  "i-next": Next,
  "i-rew": Rewind,
  "i-ff": FastForward,
  "i-eye": Eye,
  "i-eye-off": EyeOff,
  "i-lock": Lock,
  "i-unlock": Unlock,
  "i-vol": Volume,
  "i-vol-low": VolumeLow,
  "i-mute": VolumeMute,
  "i-expand": Expand,
  "i-collapse": Collapse,
  "i-expand-up": ExpandUp,
  "i-collapse-down": CollapseDown,
  "i-rotate": Rotate,
  "i-opacity": Opacity,
  "i-ta-left": TextAlignLeft,
  "i-ta-center": TextAlignCenter,
  "i-ta-right": TextAlignRight,
  "i-type": Type,
  "i-sq": ShapeSquare,
  "i-circ": ShapeCircle,
  "i-diag": ShapeLine,
  "i-arr": ShapeArrow,
  "i-tri": ShapeTriangle,
  "i-star2": ShapeStar,
  "i-contrast": Contrast,
  "i-checker": Checker,
};
