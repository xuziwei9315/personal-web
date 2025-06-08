const items = document.querySelectorAll('.masonry-item');

function resizeAll() {
  for (let item of items) {
    const rowHeight = 10; // 和 grid-auto-rows 一樣
    const contentHeight = item.getBoundingClientRect().height;
    const rowSpan = Math.ceil(contentHeight / rowHeight);
    item.style.setProperty('--row-span', rowSpan);
  }
}

window.addEventListener('load', resizeAll);
window.addEventListener('resize', resizeAll);



function showTab(index) {
  const buttons = document.querySelectorAll('.button');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => btn.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));

  buttons[index].classList.add('active');
  contents[index].classList.add('active');
  }

                                    
 const slides = document.querySelector('.slides');
                            const captions = document.querySelectorAll('.caption');
                            let currentIndex = 0;

                            function typeText(element, text, i = 0) {
                                element.textContent = text.substring(0, i);
                                if (i < text.length) {
                                setTimeout(() => typeText(element, text, i + 1), 100);
                                }
                            }

                            function showSlide(index) {
                                slides.style.transform = `translateX(-${index * 100}%)`;
                                captions.forEach(c => c.textContent = ""); // 清空所有文字
                                const currentCaption = captions[index];
                                const text = currentCaption.getAttribute('data-text');
                                typeText(currentCaption, text);
                            }

                            function nextSlide() {
                                currentIndex = (currentIndex + 1) % captions.length;
                                showSlide(currentIndex);
                            }

                            showSlide(currentIndex); // 初始顯示
                            setInterval(nextSlide, 5000); // 每5秒切換一張
 
                          
document.querySelectorAll('.circle').forEach(circle => {
  const percent = parseInt(circle.getAttribute('data-percent'));
  const label = circle.getAttribute('data-label');
  const icon = circle.getAttribute('data-icon');

  let current = 0;
  const interval = setInterval(() => {
    if (current <= percent) {
      let color;
      if (circle.classList.contains('front')) {
        color = '#4facfe';
      } else if (circle.classList.contains('back')) {
        color = '#43e97b';
      } else {
        color = '#ffb347';
      }

      circle.style.background = `conic-gradient(${color} ${current * 3.6}deg, #e0e0e0 0deg)`;
      circle.innerHTML = `<span><i class="fab ${icon}"></i>${label}<br>${current}%</span>`;
      current++;
    } else {
      clearInterval(interval);
    }
  }, 10);
});
                            
  