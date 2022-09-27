const storageKey = "STORAGE_KEY";

const formAddingBook = document.getElementById("inputBook");
const formSearchingBook = document.getElementById("searchBook");

function CheckForStorage() {
  return typeof Storage !== "undefined";
}

formAddingBook.addEventListener("submit", function (event) { 
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = parseInt(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const idTemp = document.getElementById("inputBookId").value;
  if (idTemp !== "") {
    if (confirm("Apakah Anda Yakin Menyimpan Perubahan Buku ini?")) 
    {
      const bookData = GetBookList();
      for (let index = 0; index < bookData.length; index++) {
        if (bookData[index].id == idTemp) {
          bookData[index].title = title;
          bookData[index].author = author;
          bookData[index].year = year;
          bookData[index].isComplete = isComplete;
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(bookData));
      ResetAllForm();
      RenderBookList(bookData);
      alert("Buku Berhasil Disimpan.");
      return;
    } 
    else
    {
      return;
    }
  } 
  else
  {
    const id = JSON.parse(localStorage.getItem(storageKey)) === null ? 0 + Date.now() : JSON.parse(localStorage.getItem(storageKey)).length + Date.now();
    const newBook = {
      id: id,
      title: title,
      author: author,
      year: year,
      isComplete: isComplete,
    };
  
    PutBookList(newBook);
  
    const bookData = GetBookList();
    RenderBookList(bookData);
    alert("Buku Berhasil Disimpan.");
  }
});

function PutBookList(data) {
  if (CheckForStorage()) {
    let bookData = [];

    if (localStorage.getItem(storageKey) !== null) {
      bookData = JSON.parse(localStorage.getItem(storageKey));
    }

    bookData.push(data);
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function RenderBookList(bookData) {
  if (bookData === null) {
    return;
  }

  const containerIncomplete = document.getElementById("incompleteBookshelfList");
  const containerComplete = document.getElementById("completeBookshelfList");

  containerIncomplete.innerHTML = "";
  containerComplete.innerHTML = "";
  for (let book of bookData) {
    const id = book.id;
    const title = book.title;
    const author = book.author;
    const year = book.year;
    const isComplete = book.isComplete;

    let bookItem = document.createElement("article");
    bookItem.classList.add("book_item", "select_item");
    bookItem.innerHTML = "<h3 name = " + id + ">" + title + "</h3>";
    bookItem.innerHTML += "<p>Penulis: " + author + "</p>";
    bookItem.innerHTML += "<p>Tahun: " + year + "</p>";

    let containerActionItem = document.createElement("div");
    containerActionItem.classList.add("action");

    const moveButton = CreateMoveButton(book, function (event) {
      FinishedBookHandler(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      ResetAllForm();
      RenderBookList(bookData);
    });

    const hapusButton = CreateHapusButton(function (event) {
      DeleteAnItem(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      ResetAllForm();
      RenderBookList(bookData);
    });

    const editButton = CreateEditButton(function (event) {
      EditBookHandler(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      RenderBookList(bookData);
    });

    containerActionItem.append(moveButton, editButton, hapusButton);

    bookItem.append(containerActionItem);

    if (isComplete === false) {
      containerIncomplete.append(bookItem);
      bookItem.childNodes[0].addEventListener("click", function (event) {
        MoveAnItem(event.target.parentElement);
      });

      continue;
    }

    containerComplete.append(bookItem);

    bookItem.childNodes[0].addEventListener("click", function (event) {
      MoveAnItem(event.target.parentElement);
    });
  }
}

function GetBookList() {
  if (CheckForStorage) {
    return JSON.parse(localStorage.getItem(storageKey));
  }
  return [];
}

function SearchBookList(title) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const bookList = [];

  for (let index = 0; index < bookData.length; index++) {
    const tempTitle = bookData[index].title.toLowerCase();
    const tempTitleTarget = title.toLowerCase();
    if (bookData[index].title.includes(title) || tempTitle.includes(tempTitleTarget)) {
      bookList.push(bookData[index]);
    }
  }
  return bookList;
}

function CreateMoveButton(book, eventListener) {
  const isSelesai = book.isComplete ? "Belum Selesai" : "Selesai";
  const moveButton = document.createElement("button");
  moveButton.classList.add("pindah");
  moveButton.innerText = isSelesai + " di Baca";
  moveButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return moveButton;
}

function CreateHapusButton(eventListener) {
  const hapusButton = document.createElement("button");
  hapusButton.classList.add("hapus");
  hapusButton.innerText = "Hapus Buku";
  hapusButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return hapusButton;
}

function CreateEditButton(eventListener) {
  const editButton = document.createElement("button");
  editButton.classList.add("edit");
  editButton.innerText = "Edit Buku";
  editButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return editButton;
}

function DeleteAnItem(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  if (confirm("Apakah Anda Yakin Menghapus Buku ini?")) {
    const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].id == titleNameAttribut) {
        bookData.splice(index, 1);
        break;
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
    alert("Buku Berhasil Dihapus.")
  } else {
    return;
  }
}

function MoveAnItem(itemElement) {
  if (itemElement.id === "incompleteBookshelfList" || itemElement.id === "completeBookshelfList") {
    return;
  }

  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const isComplete = itemElement.childNodes[3].childNodes[0].innerText.length === "Selesai di baca".length ? false : true;
  const id = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == id) {
      bookData[index].isComplete = isComplete;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function EditBookHandler(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == titleNameAttribut) {
      console.log("titleNameAttribut : " + titleNameAttribut)
      document.getElementById("inputBookId").value = bookData[index].id;
      document.getElementById("inputBookTitle").value = bookData[index].title;
      document.getElementById("inputBookAuthor").value = bookData[index].author;
      document.getElementById("inputBookYear").value = bookData[index].year;
      document.getElementById("inputBookIsComplete").checked = bookData[index].isComplete;
      break;
    }
  }
}

function FinishedBookHandler(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].title === title && bookData[index].id == titleNameAttribut) {
      bookData[index].isComplete = !bookData[index].isComplete;
      break;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function MoveButtonHandler(parentElement) {
  let book = FinishedBookHandler(parentElement);
  book.isComplete = !book.isComplete;
}

function ResetAllForm() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
  document.getElementById("searchBookTitle").value = "";
}

searchBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = document.getElementById("searchBookTitle").value;
  if (title === null) {
    RenderBookList(bookData);
    return;
  }
  const bookList = SearchBookList(title);
  RenderBookList(bookList);
});


window.addEventListener("load", function () {
  if (CheckForStorage) {
    if (localStorage.getItem(storageKey) !== null) {
      const bookData = GetBookList();
      RenderBookList(bookData);
    }
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});
