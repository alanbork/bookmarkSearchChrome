document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchBox');
    const resultsList = document.getElementById('results');
    let selectedIndex = -1;
    let allBookmarks = [];
    let filteredBookmarks = [];

    function loadBookmarks() {
        chrome.bookmarks.getTree((bookmarks) => {
            allBookmarks = getAllBookmarks(bookmarks);
            searchBox.addEventListener('input', () => {
                const searchTerm = searchBox.value.toLowerCase();
                filteredBookmarks = allBookmarks.filter((bookmark) => {
                    return (
                        bookmark.title.toLowerCase().includes(searchTerm) ||
                        bookmark.url.toLowerCase().includes(searchTerm)
                    );
                });
                displayResults(filteredBookmarks);
            });
            searchBox.focus();
        });
    }

    function getAllBookmarks(bookmarks) {
        let allBookmarks = [];
        bookmarks.forEach((bookmark) => {
            if (bookmark.children) {
                allBookmarks = allBookmarks.concat(getAllBookmarks(bookmark.children));
            } else if (bookmark.url) {
                allBookmarks.push({ title: bookmark.title, url: bookmark.url });
            }
        });
        return allBookmarks;
    }

   function displayResults(bookmarks) {
            resultsList.innerHTML = '';
            selectedIndex = -1; // Reset selected index
            bookmarks.forEach((bookmark, index) => {
                const listItem = document.createElement('li');

                const titleContainer = document.createElement('span')
                 const titleSpan = document.createElement('span');
                    titleSpan.textContent = bookmark.title;
                     titleSpan.classList.add('title-span')
                    titleContainer.appendChild(titleSpan);


                    const urlSpan = document.createElement('span');
                   urlSpan.textContent = `\u00A0 \u00A0\u00A0\u00A0${bookmark.url}`; //Add   to create the space,  reduce width
                     urlSpan.classList.add('url-span')
                    listItem.title = bookmark.url; // Set the tooltip to the url

                    listItem.dataset.index = index; // Store index


                    listItem.appendChild(titleContainer)
                    listItem.appendChild(urlSpan)


                    listItem.addEventListener('click', () => {
                        navigateToBookmark(bookmark.url)
                    });
                    resultsList.appendChild(listItem);
                });
                updateSelection();
            }


    function navigateToBookmark(url) {
        chrome.tabs.update({ url: url });
        window.close();
    }

    function updateSelection() {
        const listItems = resultsList.querySelectorAll('li');
        listItems.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    searchBox.addEventListener('keydown', (event) => {
        const listItems = resultsList.querySelectorAll('li');
        if (listItems.length === 0) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, listItems.length - 1);
            updateSelection();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection();
        } else if (event.key === 'Enter') {
            if (selectedIndex >= 0 && listItems[selectedIndex]) {
                navigateToBookmark(filteredBookmarks[selectedIndex].url);
            }
        }
    });
    loadBookmarks();
});

