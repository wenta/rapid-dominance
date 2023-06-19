export const black = 0x000000;
export const white = 0xFFFFFF;
export const red = 0xFF0000;
export const green = 0x00FF00;
export const blue = 0x0000FF;
export const yellow = 0xFFFF00;
export const cyan = 0x00FFFF;
export const magenta = 0xFF00FF;
export const gray = 0x808080;
export const silver = 0xC0C0C0;
export const darkGray = 0x808080;
export const orange = 0xFFA500;
export const purple = 0x800080;
export const brown = 0xA52A2A;
export const pink = 0xFFC0CB;
export const lime = 0x00FF00;

export function getColor(number: number): number {
    switch (number) {
      case 1:
        return black;
      case 2:
        return white;
      case 3:
        return red;
      case 4:
        return green;
      case 5:
        return blue;
      case 6:
        return yellow;
      case 7:
        return cyan;
      case 8:
        return magenta;
      case 9:
        return gray;
      case 10:
        return silver;
      case 11:
        return darkGray;
      case 12:
        return orange;
      case 13:
        return purple;
      case 14:
        return brown;
      case 15:
        return pink;
      case 0:
        return lime;
      default:
        return white; 
    }
}
