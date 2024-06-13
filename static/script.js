const $ = document.querySelector.bind(document);
const dialog = $('#new-element');
const form = $('#new');
const btn1 = $('#addfolder');
const delfolders = $('#folder');
const delfiles = $('#dfiles');
const cancelBtn1 = $('#cancel1');
const cancelBtn2 = $('#cancel2');
const upload = $('#upload');
const uploadform = $('#uploadform');
const delfile = $('#delfilebtn');
const delfolder = $('#delfolderbtn');
const nameFormBtn = $('#newnamebtn');
const nameForm = $('#new-element-name');
const actualForm = $('#file-upload');
const fileChosen = $('#file-chosen');
const ip = 'http://localhost';
const mainImageDiv = $('#main-image-div');
const filterSection = $('.filters-display');
const moveSec = $('#moveSec');
const lilImgs = document.querySelectorAll('.lil-imgs');
const saveImgBtn = $('#saveImg');

if (mainImageDiv) {
  const image = mainImageDiv;
  let dataUrl;
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    ctx.drawImage(image, 0, 0);
    dataUrl = canvas.toDataURL();
  };
  saveImgBtn.addEventListener('click', async () => {
    const response = await fetch(ip + ':4000/imageSaved', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newImg: dataUrl
      }),
    });
    const res = await response.json();
    alert(res);
  });
  for (var i = 0; i < lilImgs.length; i++) {
    let filter = lilImgs[i].style.filter;
    lilImgs[i].addEventListener('click', (e) => {
      mainImageDiv.style.filter = filter;
      const image = mainImageDiv;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.filter = filter
      ctx.drawImage(image, 0, 0);
      dataUrl = canvas.toDataURL();
      console.log(dataUrl.substr(0,36));
    });
  }
} else {
  actualForm.addEventListener('change', () => {
    fileChosen.textContent = actualForm.value;
  });

  upload.addEventListener('click', () => {
    if ($('#file-upload').value) {
      upload.type = 'submit';
      uploadform.submit();
    }
  });
  cancelBtn1.addEventListener('click', () => {
    dialog.close();
  });
  btn1.addEventListener('click', () => {
    $('#dialogtext').innerHTML = 'nazwa nowego katalogu:';
    dialog.showModal();
  });
  function logdelete(event) {
    confirm('Jesteś pewny, że chcesz to usunąć?') ? event.submit() : null;
  }
  if (nameFormBtn) {
    nameFormBtn.addEventListener('click', () => {
      nameForm.showModal();
    });
  }

  cancelBtn2.addEventListener('click', () => {
    nameForm.close();
  });
}
