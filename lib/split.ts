// A small splitter. Motion's free package has no split-text utility, so
// headlines are split here into words and letters. Spaces stay real spaces so
// lines still wrap where the browser wants.

export type Word = { text: string; letters: string[]; index: number };

export function splitWords(text: string): Word[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({ text: word, letters: Array.from(word), index }));
}

/** Groups elements into lines by their offsetTop. Returns a line index per element. */
export function lineIndexes(elements: (HTMLElement | null)[]): number[] {
  let line = -1;
  let lastTop = Number.NEGATIVE_INFINITY;
  return elements.map((el) => {
    const top = el?.offsetTop ?? lastTop;
    if (top > lastTop + 1) {
      line += 1;
      lastTop = top;
    }
    return Math.max(line, 0);
  });
}
