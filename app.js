const form = document.querySelector('#form'),
searchInput = document.querySelector('#search'),
songsContainer = document.querySelector('#songs-container'),
prevAndNextContainer = document.querySelector('#prev-and-next-container');

const apiURL = `https://api.lyrics.ovh`;

const fetchData = async url => {
  const response = await fetch(url)
  return await response.json()
}

const getMoreSongs = async url => {
  const data = await fetchData(`https://cors-anywhere.herokuapp.com/${url}`);
  insertSongsIntoPage(data)
}

const insertNextAndPrevButtons = ({prev, next}) => {
  prevAndNextContainer.innerHTML = `
    ${prev?`<button class="btn" onClick="getMoreSongs('${prev}')">Anteriores</button>` :`` }
    ${next?`<button class="btn" onClick="getMoreSongs('${next}')">Próximos</button>` :`` }
  `
}

const insertSongsIntoPage = ({data, prev, next}) => {
  songsContainer.innerHTML = data.map(({artist: {name}, title, preview, album:{cover}}) => `
    <li class="song">
      <span class="song-artist"> <strong>${name}</strong> - ${title}</span>
      <button class="btn" data-artist="${name}" data-song-title="${title}" data-preview-mp3="${preview}" data-image="${cover}">Ver letra</button>
    </li>
  `).join('');
  if(data==0){
    songsContainer.innerHTML = `<li class="warning-message">Não foram encontrados resultados para sua busca! :(</li>`
  }
  console.log(data)
  
  if(prev || next){
    insertNextAndPrevButtons({prev, next})
    return
  }
  prevAndNextContainer.innerHTML = ``
  
}

const fetchSongs = async term => {
  const data = await fetchData(`${apiURL}/suggest/${term}`);

  insertSongsIntoPage(data)
}

const handleFormSubmit = event => {
  event.preventDefault()

  const searchTerm = searchInput.value.trim();

  searchInput.value = ''
  searchInput.focus()

  if(!searchTerm){
    songsContainer.innerHTML = `<li class="warning-message">Digite um termo válido</li>`
    return 
  }
  fetchSongs(searchTerm)
}

form.addEventListener('submit', handleFormSubmit )

const insertLyricsIntoPage = ({lyrics, artist,songTitle,preview,cover}) => {
  let validLyrics = lyrics? `<p class='lyrics'>${lyrics}</p>` : `<p class="lyrics warning-message">Não temos essa letra diponível ainda! :(</p>` 
  
  songsContainer.innerHTML = `
    <li class='lyrics-container join'>
      <h2><strong>${songTitle}</strong> <br> By ${artist}</h2><img class="cover" src="${cover}">
    </li>
    <li class='lyrics-container'>
      ${validLyrics}
    </li>
    <audio class="audioStyle" controls="" autoplay="" name="media"><source src="${preview}" type="audio/mpeg"></audio>
  `
}

const fetchLyrics = async (artist,songTitle, preview, cover) => {
  const data = await fetchData(`${apiURL}/v1/${artist}/${songTitle}`),
  lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g,'<br>');
  console.log(data)
  console.log(cover)

  insertLyricsIntoPage({lyrics, artist,songTitle,preview,cover})

  
}

const handleSongsContainerClick = event => {
  const clickedElement = event.target;

  if (clickedElement.tagName === 'BUTTON'){
    const artist = clickedElement.getAttribute('data-artist'),
    songtitle = clickedElement.getAttribute('data-song-title'),
    cover = clickedElement.getAttribute('data-image'),
    preview = clickedElement.getAttribute('data-preview-mp3');

    prevAndNextContainer.innerHTML = '';
    fetchLyrics(artist,songtitle, preview, cover)

  }
}

songsContainer.addEventListener('click', handleSongsContainerClick)