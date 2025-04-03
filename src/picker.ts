import { emojiData } from './data.js';
export default class EmojiPicker {
  private activePicker: {
    trigger: HTMLElement;
    picker: HTMLDivElement;
    searchInput: HTMLInputElement;
    categoryContainer: HTMLDivElement;
    hoverDisplay: HTMLDivElement; // New section for hovered emoji display
  } | null = null;

  private emojiMap = emojiData;
  private cache_bust: number = Date.now();
  private activeCategory: string;

  constructor() {
    this.activeCategory = this.emojiMap[0]?.category || ''; // ✅ Initialize with the first category
    this.init();
    this.getAndSetCacheTime();
  }

  private getAndSetCacheTime() {
    try {
      const bust = localStorage.getItem('fatsu_emoji_cache_bust');
      this.cache_bust = bust ? Number(bust) : Date.now();
      localStorage.setItem(
        'fatsu_emoji_cache_bust',
        this.cache_bust.toString(),
      );
    } catch (e) {
      this.cache_bust = Date.now();
    }
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

    this.activeCategory = this.emojiMap[0]?.category || ''; // ✅ Reset to the first category

    const overlay = document.createElement('div');
    overlay.classList.add('emoji-picker-overlay');
    overlay.style.overflow = 'hidden'; // ✅ Prevent scrolling
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

    // Create the section to display the hovered emoji name and image
    const hoverDisplay = document.createElement('div');
    const defaultImage =
      'https://media.fatsu.com/fatsoji/smlies/Bookworm.png?cache_bust=' +
      this.cache_bust;
    hoverDisplay.classList.add('emoji-hover-display');
    hoverDisplay.innerHTML = `
      <img class="hover-emoji" src="${defaultImage}" height="32" width="32" alt="default emoji">
      <span class="emoji-name">What's your mood?</span>
    `;

    searchInput.addEventListener('input', () => {
      this.filterEmojis(searchInput.value, emojiList, callback, trigger);
      searchInput.focus();
    });

    // Adding categories to categoryContainer
    this.emojiMap.forEach(({ category, categoryIcon }) => {
      const categoryImg = document.createElement('img');
      categoryImg.classList.add('category-button');
      categoryImg.src = categoryIcon;
      categoryImg.width = 32;
      categoryImg.height = 32;
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

    // First append searchInput, categoryContainer, and emojiList
    picker.appendChild(searchInput);
    picker.appendChild(categoryContainer);
    picker.appendChild(emojiList);

    // Now append the hoverDisplay after the emoji list
    picker.appendChild(hoverDisplay);

    document.body.appendChild(overlay);
    document.body.appendChild(picker);
    this.activePicker = {
      trigger,
      picker,
      searchInput,
      categoryContainer,
      hoverDisplay,
    };

    this.populateEmojis(emojiList, callback, trigger);
    this.positionPicker(trigger, picker);
    searchInput.focus();

    // Disable page scroll when picker is open
    document.body.classList.add('no-scroll');
  }

  public closePicker() {
    if (this.activePicker) {
      this.activePicker.picker.remove();
      document.querySelector('.emoji-picker-overlay')?.remove();
      this.activePicker = null;

      // Enable page scroll when picker is closed
      document.body.classList.remove('no-scroll');
      window.removeEventListener('resize', this.handleResize);
    }
  }

  private filterEmojis(
    query: string,
    container: HTMLDivElement,
    callback: (value: { url: string; name: string }) => void,
    trigger: HTMLElement,
  ) {
    if (this.activePicker) {
      this.activePicker.categoryContainer.style.display = query
        ? 'none'
        : 'flex';
    }
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
    const isSearching = filter.length > 0;

    this.emojiMap.forEach(({ category, emojis: emojiData }) => {
      if (!isSearching && this.activeCategory !== category) return;

      const filteredEmojis = filter
        ? emojiData.filter(({ name, url }) =>
            this.fuzzyMatch(filter, url, name),
          )
        : emojiData;

      if (filteredEmojis.length === 0) return;
      hasEmojis = true;

      const categorySection = document.createElement('div');
      categorySection.classList.add('emoji-category-section');

      const categoryTitle = document.createElement('h4');
      categoryTitle.textContent = category;
      categoryTitle.classList.add('emoji-category-title');
      categorySection.appendChild(categoryTitle);

      const emojiContainer = document.createElement('div');
      emojiContainer.classList.add('emoji-container');

      filteredEmojis.forEach(({ url, name }) => {
        const img = document.createElement('img');
        img.classList.add('emoji-button');
        img.src = url + `?cache_bust=${this.cache_bust}`;
        img.height = 32;
        img.width = 32;
        img.alt = 'emoji';
        img.addEventListener('mouseenter', () => {
          this.updateHoverDisplay(url, name);
        });
        img.addEventListener('mouseleave', () => {
          this.updateHoverLeaveDisplay();
        });
        img.addEventListener('click', () => {
          callback({ url, name });
          this.insertEmoji(trigger, url);
        });
        emojiContainer.appendChild(img);
      });

      categorySection.appendChild(emojiContainer);
      container.appendChild(categorySection);
    });

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
    const searchQuery = this.activePicker?.searchInput.value || '';
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
  }

  private handleResize = () => {
    if (this.activePicker) {
      this.positionPicker(this.activePicker.trigger, this.activePicker.picker);
    }
  };

  private positionPicker(trigger: HTMLElement, picker: HTMLDivElement) {
    const rect = trigger.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const pickerHeight = picker.offsetHeight;

    picker.style.position = 'absolute';

    picker.style.top =
      spaceAbove > pickerHeight || spaceBelow < pickerHeight
        ? `${rect.top + window.scrollY - pickerHeight - 5}px`
        : `${rect.bottom + window.scrollY + 5}px`;

    picker.style.left = `${rect.left + window.scrollX}px`;

    window.removeEventListener('resize', this.handleResize);
    window.addEventListener('resize', this.handleResize);
  }

  private updateHoverDisplay(emojiUrl: string, emojiName: string) {
    if (this.activePicker) {
      const hoverDisplay = this.activePicker.hoverDisplay;
      const hoverEmoji = hoverDisplay.querySelector(
        '.hover-emoji',
      ) as HTMLImageElement;
      const emojiNameSpan = hoverDisplay.querySelector(
        '.emoji-name',
      ) as HTMLSpanElement;

      hoverEmoji.src = emojiUrl + `?cache_bust=${this.cache_bust}`;
      hoverEmoji.alt = emojiName;
      emojiNameSpan.textContent = emojiName;
    }
  }
  private updateHoverLeaveDisplay() {
    if (this.activePicker) {
      const defaultImage =
        'https://media.fatsu.com/fatsoji/smlies/Bookworm.png?cache_bust=' +
        this.cache_bust;
      this.activePicker.hoverDisplay.classList.add('emoji-hover-display');
      this.activePicker.hoverDisplay.innerHTML = `
    <img class="hover-emoji" src="${defaultImage}" height="32" width="32" alt="default emoji">
    <span class="emoji-name">What's your mood?</span>
  `;
    }
  }
}
