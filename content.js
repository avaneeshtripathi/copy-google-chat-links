/* Flag to toggle the link generation for google chat messages */
let enableCopyStatus = false;

/* Listens to the toggle state from extension popup */
chrome.runtime.onMessage.addListener (
    function(request) {
        if( request.type === "toggleSwitch" ) {
            enableCopyStatus = request.status ?? false;
        }
    }
);

/* Initialises the toggle enabled status when extension is loaded etc */
chrome.storage.sync.get(['isCopyEnabled'], function({ isCopyEnabled }) {
    enableCopyStatus = isCopyEnabled;
})

/* Copies a text to user's clipboard */
async function copyToClipboard (textToCopy) {
    try {
        const element = document.createElement('textarea');
        element.value = textToCopy;
        element.setAttribute('readonly', '');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        document.body.appendChild(element);
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);
    } catch(e) {
        console.error('Failed to copy to clipboard.', e);
    }
};

const stringLinkSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="var(--icon-color)" width="18px" height="18px" viewBox="0 0 28 28" version="1.1"><g id="surface1"><path d="M 25.949219 2.058594 C 23.21875 -0.675781 18.738281 -0.675781 16.007812 2.058594 L 10.636719 7.425781 C 12.480469 6.902344 14.476562 7.039062 16.21875 7.851562 L 19.011719 5.0625 C 20.097656 3.976562 21.859375 3.976562 22.945312 5.0625 C 24.03125 6.148438 24.03125 7.910156 22.945312 8.996094 L 19.4375 12.503906 L 17.132812 14.8125 C 16.046875 15.898438 14.28125 15.898438 13.195312 14.8125 L 10.191406 17.816406 C 10.890625 18.515625 11.703125 19.039062 12.554688 19.367188 C 14.863281 20.277344 17.539062 19.929688 19.554688 18.339844 C 19.746094 18.183594 19.960938 18.011719 20.136719 17.816406 L 23.761719 14.191406 L 25.949219 12 C 28.703125 9.269531 28.703125 4.808594 25.949219 2.058594 Z M 11.664062 20.277344 L 8.988281 22.953125 C 7.902344 24.039062 6.140625 24.039062 5.054688 22.953125 C 3.96875 21.867188 3.96875 20.105469 5.054688 19.019531 L 10.871094 13.203125 C 11.957031 12.117188 13.71875 12.117188 14.804688 13.203125 L 17.808594 10.199219 C 17.113281 9.5 16.296875 8.976562 15.445312 8.648438 C 13.023438 7.679688 10.171875 8.125 8.136719 9.945312 C 8.039062 10.023438 7.941406 10.121094 7.867188 10.199219 L 2.050781 16.015625 C -0.683594 18.746094 -0.683594 23.226562 2.050781 25.957031 C 4.78125 28.691406 9.261719 28.691406 11.996094 25.957031 L 17.246094 20.648438 C 14.574219 21.265625 13.953125 21.191406 11.664062 20.277344 Z M 11.664062 20.277344 "/></g></svg>`;

/* Creates a button element and attaches the on click handler to it */
function createButtonElement (onClick) {
    const btn = document.createElement("button");
    btn.name = "customCopyLinkButton";
    btn.className = "customCopyLinkButton";
    btn.onclick = onClick;
    btn.innerHTML = stringLinkSvg;
    return btn;
};

/* An event listener on mouse move. debounced by 200 milliseconds to reduce no of calls */
const handleMouseMove = lodashDebounce(async function ({ target: hoverElement }) {
    if (!enableCopyStatus) return;

    try {
        /* Early return for all the unnecessary elements */
        const ancestorNode = hoverElement.closest('div[jsname="Ne3sFf"]');
        if (!ancestorNode) return;

        /* Early return if the link is already generated */
        const linkAlreadyCreated = ancestorNode.querySelector('button[name="customCopyLinkButton"]');
        if (linkAlreadyCreated) return;

        /* Generate the link for the message */
        const jsData = ancestorNode.getAttribute('jsdata');

        const [, part2, part3] = jsData.split(',')
        let [space] = part3.split(';');
        if (space.startsWith('space')) {
            space = space.replace('space', 'room');
        }
        const finalLink = ["https://chat.google.com", space, part2].join('/');

        /* Append a button to copy the generated link */
        const descendantNode = ancestorNode.querySelector('div.HO0hcf > div');
        const button = createButtonElement(() => {
          copyToClipboard(finalLink);
          console.log(finalLink);
        });
        
        descendantNode.insertBefore(button, descendantNode.lastChild);
    } catch (e) {
        console.error('Failed to generate the link for current message.', e);
    }
}, 200);

document.addEventListener('mousemove', handleMouseMove, false);

/**
 * Debounce related stuff from Lodash
 */
const lodashFreeGlobal = typeof global === 'object' && global !== null && global.Object === Object && global

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis === 'object' && globalThis !== null && globalThis.Object == Object && globalThis

/** Detect free variable `self`. */
const freeSelf = typeof self === 'object' && self !== null && self.Object === Object && self
 
/** Used as a reference to the global object. */
const lodashRoot = freeGlobalThis || lodashFreeGlobal || freeSelf || Function('return this')();

function lodashDebounce(func, wait, options) {
    let lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime
  
    let lastInvokeTime = 0
    let leading = false
    let maxing = false
    let trailing = true
  
    // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
    const useRAF = (!wait && wait !== 0 && typeof lodashRoot.requestAnimationFrame === 'function')
  
    if (typeof func !== 'function') {
      throw new TypeError('Expected a function')
    }
    wait = +wait || 0
    if (lodashIsObject(options)) {
      leading = !!options.leading
      maxing = 'maxWait' in options
      maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
      trailing = 'trailing' in options ? !!options.trailing : trailing
    }
  
    function invokeFunc(time) {
      const args = lastArgs
      const thisArg = lastThis
  
      lastArgs = lastThis = undefined
      lastInvokeTime = time
      result = func.apply(thisArg, args)
      return result
    }
  
    function startTimer(pendingFunc, wait) {
      if (useRAF) {
        lodashRoot.cancelAnimationFrame(timerId)
        return lodashRoot.requestAnimationFrame(pendingFunc)
      }
      return setTimeout(pendingFunc, wait)
    }
  
    function cancelTimer(id) {
      if (useRAF) {
        return lodashRoot.cancelAnimationFrame(id)
      }
      clearTimeout(id)
    }
  
    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time
      // Start the timer for the trailing edge.
      timerId = startTimer(timerExpired, wait)
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result
    }
  
    function remainingWait(time) {
      const timeSinceLastCall = time - lastCallTime
      const timeSinceLastInvoke = time - lastInvokeTime
      const timeWaiting = wait - timeSinceLastCall
  
      return maxing
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting
    }
  
    function shouldInvoke(time) {
      const timeSinceLastCall = time - lastCallTime
      const timeSinceLastInvoke = time - lastInvokeTime
  
      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
    }
  
    function timerExpired() {
      const time = Date.now()
      if (shouldInvoke(time)) {
        return trailingEdge(time)
      }
      // Restart the timer.
      timerId = startTimer(timerExpired, remainingWait(time))
    }
  
    function trailingEdge(time) {
      timerId = undefined
  
      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time)
      }
      lastArgs = lastThis = undefined
      return result
    }
  
    function cancel() {
      if (timerId !== undefined) {
        cancelTimer(timerId)
      }
      lastInvokeTime = 0
      lastArgs = lastCallTime = lastThis = timerId = undefined
    }
  
    function flush() {
      return timerId === undefined ? result : trailingEdge(Date.now())
    }
  
    function pending() {
      return timerId !== undefined
    }
  
    function debounced(...args) {
      const time = Date.now()
      const isInvoking = shouldInvoke(time)
  
      lastArgs = args
      lastThis = this
      lastCallTime = time
  
      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime)
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = startTimer(timerExpired, wait)
          return invokeFunc(lastCallTime)
        }
      }
      if (timerId === undefined) {
        timerId = startTimer(timerExpired, wait)
      }
      return result
    }
    debounced.cancel = cancel
    debounced.flush = flush
    debounced.pending = pending
    return debounced
}

function lodashIsObject(value) {
    const type = typeof value
    return value != null && (type === 'object' || type === 'function')
}