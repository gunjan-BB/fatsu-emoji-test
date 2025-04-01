import { emojiData } from './data.js';
export class EmojiPicker {
  private activePicker: {
    trigger: HTMLElement;
    picker: HTMLDivElement;
    searchInput: HTMLInputElement;
    categoryContainer: HTMLDivElement;
  } | null = null;

  private emojiMap = emojiData;

  private activeCategory: string = this.emojiMap[0]!.category;

  constructor() {
    this.init();
  }

  private init() {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        this.activePicker &&
        !target.closest('.emoji-picker') &&
        !target.closest('[data-emoji-picker]')
      ) {
        this.closePicker();
      }
    });
  }

  public openPicker(
    trigger: HTMLElement,
    callback: (value: { url: string; name: string }) => void,
  ) {
    this.closePicker();

    // Transparent overlay
    const overlay = document.createElement('div');
    overlay.classList.add('emoji-picker-overlay');
    overlay.addEventListener('click', () => this.closePicker());

    const picker = document.createElement('div');
    picker.classList.add('emoji-picker');

    const searchInput = document.createElement('input');
    searchInput.classList.add('emoji-search');
    searchInput.placeholder = 'Search emojis...';
    searchInput.type = 'text';

    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('emoji-category-container');

    const emojiList = document.createElement('div');
    emojiList.classList.add('emoji-list');

    searchInput.addEventListener('input', () => {
      this.filterEmojis(searchInput.value, emojiList, callback, trigger);
      searchInput.focus(); // Ensure input retains focus
    });

    this.emojiMap.forEach(({ category, categoryIcon }) => {
      const categoryImg = document.createElement('img');
      categoryImg.classList.add('category-button');
      categoryImg.src = categoryIcon;
      categoryImg.width = 28;
      categoryImg.height = 28;
      if (category === this.activeCategory) {
        categoryImg.classList.add('active-category');
      }
      categoryImg.addEventListener('click', () => {
        this.switchCategory(category, emojiList, callback, trigger);
        document
          .querySelectorAll('.category-button')
          .forEach((btn) => btn.classList.remove('active-category'));
        categoryImg.classList.add('active-category');
      });
      categoryContainer.appendChild(categoryImg);
    });

    picker.appendChild(searchInput);
    picker.appendChild(categoryContainer);
    picker.appendChild(emojiList);

    document.body.appendChild(overlay);
    document.body.appendChild(picker);
    this.activePicker = { trigger, picker, searchInput, categoryContainer };

    this.populateEmojis(emojiList, callback, trigger);
    this.positionPicker(trigger, picker);
    searchInput.focus();
  }

  public closePicker() {
    if (this.activePicker) {
      this.activePicker.picker.remove();
      document.querySelector('.emoji-picker-overlay')?.remove();
      this.activePicker = null;
    }
  }

  private filterEmojis(
    query: string,
    container: HTMLDivElement,
    callback: (value: { url: string; name: string }) => void,
    trigger: HTMLElement,
  ) {
    this.populateEmojis(container, callback, trigger, query);
  }

  private populateEmojis(
    container: HTMLDivElement,
    callback: (value: { url: string; name: string }) => void,
    trigger: HTMLElement,
    filter: string = '',
  ) {
    container.innerHTML = '';

    let hasEmojis = false;

    this.emojiMap.forEach(({ category, emojis: emojiData }) => {
      if (this.activeCategory && this.activeCategory !== category) return;

      const filteredEmojis = filter
        ? emojiData.filter(({ name, url }) =>
            this.fuzzyMatch(filter, url, name),
          )
        : emojiData;

      if (filteredEmojis.length === 0) return;

      hasEmojis = true;

      const categorySection = document.createElement('div');
      categorySection.classList.add('emoji-category-section');
      categorySection.innerHTML = `<h4>${category}</h4>`;

      filteredEmojis.forEach(({ url, name }) => {
        const img = document.createElement('img');
        img.classList.add('emoji-button');
        img.src = url;
        img.height = 16;
        img.width = 16;
        img.alt = 'emoji';
        img.addEventListener('click', () => {
          callback({ url, name });
          this.insertEmoji(trigger, url);
        });
        categorySection.appendChild(img);
      });

      container.appendChild(categorySection);
    });

    // If no emojis were found, show a message
    if (!hasEmojis) {
      const noResultsMessage = document.createElement('div');
      noResultsMessage.classList.add('no-emojis-found');
      noResultsMessage.textContent = 'No emojis found';
      container.appendChild(noResultsMessage);
    }
  }

  private fuzzyMatch(query: string, emoji: string, keywords: string): boolean {
    query = query.toLowerCase();
    return (
      emoji.includes(query) ||
      keywords.includes(query) ||
      this.approximateMatch(query, keywords)
    );
  }

  private approximateMatch(query: string, keywords: string): boolean {
    let i = 0,
      j = 0;
    while (i < query.length && j < keywords.length) {
      if (query[i] === keywords[j]) i++;
      j++;
    }
    return i === query.length;
  }

  private switchCategory(
    category: string,
    container: HTMLDivElement,
    callback: (value: { url: string; name: string }) => void,
    trigger: HTMLElement,
  ) {
    this.activeCategory = category;
    const searchQuery = this.activePicker?.searchInput.value || ''; // Preserve search query
    this.populateEmojis(container, callback, trigger, searchQuery);
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
    picker.style.position = 'absolute';
    picker.style.left = `${rect.left + window.scrollX}px`;
    picker.style.top = `${rect.bottom + window.scrollY + 5}px`;
  }
}
