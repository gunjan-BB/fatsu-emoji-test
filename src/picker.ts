export class EmojiPicker {
  private activePicker: {
    trigger: HTMLElement;
    picker: HTMLDivElement;
  } | null = null;

  private emojis: string[] = [
    '😀',
    '😂',
    '😍',
    '😎',
    '🤔',
    '🙄',
    '🥳',
    '😭',
    '🔥',
    '❤️',
    '👍',
    '🎉',
  ];

  constructor() {
    this.init();
  }

  private init() {
    document.addEventListener('click', (event: MouseEvent) => {
      setTimeout(() => {
        const target = event.target as HTMLElement;
        if (
          this.activePicker &&
          !target.closest('.emoji-picker') &&
          !target.closest('[data-emoji-picker]')
        ) {
          this.closePicker();
        }
      }, 0);
    });

    window.addEventListener('resize', () => {
      if (this.activePicker) {
        this.positionPicker(
          this.activePicker.trigger,
          this.activePicker.picker,
        );
      }
    });
  }

  public openPicker(trigger: HTMLElement, callback: (value: string) => void) {
    this.closePicker(); // Close existing picker

    const picker = document.createElement('div');
    picker.classList.add('emoji-picker');

    picker.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent closing when clicking inside
    });

    this.emojis.forEach((emoji) => {
      const emojiButton = document.createElement('button');
      emojiButton.classList.add('emoji-button');
      emojiButton.textContent = emoji;
      emojiButton.addEventListener('click', () => {
        callback(emoji);
        this.insertEmoji(trigger, emoji);
      });
      picker.appendChild(emojiButton);
    });

    document.body.appendChild(picker);
    this.activePicker = { trigger, picker };

    this.positionPicker(trigger, picker);
  }

  public closePicker() {
    if (this.activePicker) {
      this.activePicker.picker.remove();
      this.activePicker = null;
    }
  }

  private insertEmoji(trigger: HTMLElement, emoji: string) {
    if (
      trigger instanceof HTMLInputElement ||
      trigger instanceof HTMLTextAreaElement
    ) {
      trigger.value += emoji;
    } else if (trigger.isContentEditable) {
      trigger.innerHTML += emoji;
    }
    this.closePicker();
  }

  private positionPicker(trigger: HTMLElement, picker: HTMLDivElement) {
    const rect = trigger.getBoundingClientRect();
    const pickerHeight = 200; // Approximate height of the picker
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number, left: number;

    // Open picker **above** if not enough space below, otherwise open below
    if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
      top = rect.top + window.scrollY - pickerHeight - 5;
    } else {
      top = rect.bottom + window.scrollY + 5;
    }

    left = rect.left + window.scrollX;

    // Ensure picker doesn't overflow screen horizontally
    const pickerWidth = 250; // Approximate width
    if (left + pickerWidth > window.innerWidth) {
      left = window.innerWidth - pickerWidth - 10; // Adjust left to stay in viewport
    }

    // **Mobile Optimization**
    if (window.innerWidth < 480) {
      picker.style.width = '95vw'; // Full width on small screens
      picker.style.left = '2.5vw';
      picker.style.top = `${window.innerHeight / 2 - pickerHeight / 2}px`; // Centered vertically
      picker.style.position = 'fixed';
    } else {
      picker.style.position = 'absolute';
      picker.style.left = `${left}px`;
      picker.style.top = `${top}px`;
    }
  }
}
