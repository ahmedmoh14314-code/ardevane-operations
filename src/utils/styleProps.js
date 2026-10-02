// styled-components v6 forwards unknown props straight to the DOM, so a
// styling-only prop like `type` on a <div> becomes an invalid HTML attribute
// and React warns. This keeps the named props out of the DOM while callers
// keep writing <Row type="horizontal"> as before.
export const noForward = (...blocked) => ({
  shouldForwardProp: (prop) => !blocked.includes(prop),
});
