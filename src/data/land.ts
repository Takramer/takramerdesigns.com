// The land for SunClock.astro. Source: Natural Earth 1:110m land (ne_110m_land), public domain,
// naturalearthdata.com; GeoJSON from github.com/nvkelso/natural-earth-vector. Rasterized once
// (11 November, /tmp/takd-clock/scripts/raster.mjs) to an equirectangular grid of 4-degree cells,
// 90 across and 33 down, from 76 N to 56 S: the empty polar rows are cropped. A cell is land when a
// third or more of a 5 by 5 sample of points inside it falls on land (even-odd point-in-polygon).
// Bits row by row from the north-west cell, eight to a byte, base64.
export const LAND = 'AAPvgf8AABA/6IAD9/v8f4APCv////3///OPGA///////D//8MOAD//////+Bh/8fAABn////wwAA///gAb/////wgAAf//gAP/////4AAAP/+AAP/////wAAAP/4AAd9b///IAAAP/wAAYL///6QAAAH/wAAfA///5wAAAD/gAA/////8AAAAB4gAB/////4AAAAA4AAB//fP/wAAAAAeAAB//+HPAAAAAADAAB//4GHEAAAAAAPAB//8CBAAAAAAAfwA//4ACIAAAAAAf4AB/4AG4AAAAAAf8AB/gAC8wAAAAAf/AA/gABAcAAAAAf/AA/gAAAAAAAAAP+AA/kAADoAAAAAH+AA/oAAH8AAAAAH+AA/IAAP+AAAAAH4AAfAAAf+AAAAAH4AAeAAAP+AAAAAHwAAMAAAMeAAAAAPgAAAAAAAMAAAAAOAAAAAAAAECAAAAOAAAAAAAAAEAAAAMAAAAAAAAAAAAAAEAAAAAAAAAAA'
export const COLS = 90, ROWS = 33, CELL = 4, NORTH = 76
// Charlotte, NC, the one fixed place: latitude north, longitude east (so west is negative).
export const CLT = [35.23, -80.84]
