(function() {
  var author = {
    name: 'Filipe Araujo',
    github: 'github.com/filaraujo'
  };
  var docEl = document.body || document.documentElement;
  var lastFocus = docEl;
  var lastModal = {};
  var lastOverflow;

  /**
   * sets the animate state of the element and focuses the target
   */
  function animateAndFocus() {
    this.animate = true;
    lastFocus = document.activeElement;
    this.$.content.focus();
  }

  /**
   * removes the component from the body and puts it back in its original
   * location. Also fires the 'modal-close' event and sets focus.
   */
  function close() {
    this.animate = false;
    this.debounce('swap', swapAndResetFocus, 300);
    this.fire('modal-close', {modal: this});
  }

  /**
   * closes last modal
   */
  function closeLastModal() {
    if (lastModal === this || !lastModal.shown) {
      return;
    }
    lastModal.shown = false;
  }

  /**
   * ensures that when focus has left a modal, and that modal is
   * still open it will reset focus to the modal
   */
  function ensureFocus(e) {
    if (lastModal.shown && !lastModal.contains(e.target)) {
      lastModal.$.content.focus();
    }
  }

  /**
   * shows the modal, will also close any existing modal
   */
  function show() {
    closeLastModal.call(this);
    lastModal = this;
    lastOverflow = docEl.style.overflow;

    this._parentEl.appendChild(this._placeholder);
    docEl.style.overflow = 'hidden';
    docEl.insertBefore(this, docEl.firstChild);

    this.debounce('animate', animateAndFocus, 300);
    this.fire('modal-show', {modal: this});
  }

  /**
   * swaps out the modal and returns focus to original element
   */
  function swapAndResetFocus() {
    this._parentEl.replaceChild(this, this._placeholder);
    docEl.style.overflow = !lastModal.shown ? '' : lastOverflow;
    lastFocus.focus();
  }

  /**
   * AkyralModalImpl
   *
   * @polymerBehavior
   */
  var AkyralModalImpl = {

    properties: {

      /**
       * defines the animate state of the component, triggers the animation
       */
      animate: {
        reflectToAttribute: true,
        type: Boolean,
        value: false
      },

      /**
       * defines the author
       */
      author: {
        readOnly: true,
        type: Object,
        value: function() {
          return author;
        }
      },

      /**
       * defines the visibility state of the component
       */
      shown: {
        observer: '_shownChanged',
        reflectToAttribute: true,
        type: Boolean,
        value: false
      },

      /**
       * defines the pinned of the component
       */
      pinned: {
        reflectToAttribute: true,
        type: String
      },

      /**
       * defines the position of the component
       */
      position: {
        reflectToAttribute: true,
        type: String
      },

      /**
       * defines the type of the component
       */
      type: {
        reflectToAttribute: true,
        type: String,
        value: 'takeover'
      }
    },

    keyBindings: {
      'esc': 'close'
    },

    /**
     * closes the modal
     */
    close: function() {
      this.shown = false;
    },

    /**
     * opens the modal
     */
    show: function() {
      this.shown = true;
    },

    /**
     * opens or closes the modal
     */
    toggle: function() {
      this.shown = !this.shown;
    },

    /**
     * change handler which will either call show or close based on the shown
     * value
     */
    _shownChanged: function(newVal, oldVal) {
      var func = newVal ? show : close;

      if (oldVal === undefined) {
        return;
      }

      func.call(this);
    },

    // LIFECYCLE EVENTS

    attached: function() {
      if (this._parentEl) {
        return;
      }

      this._parentEl = Polymer.dom(this.parentElement).node;
      this._placeholder = document.createElement('akyral-modal-placeholder');
    }
  };

  /**
   * Akyral Modal Behavior
   *
   * @polymerBehavior
   */
  window.AkyralModalBehavior = [
    Polymer.IronA11yKeysBehavior,
    AkyralModalImpl
  ];

  document.addEventListener('focus', ensureFocus, true);
}());
