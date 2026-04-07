const safariWin = document.getElementById('safari-window');
const iframe = document.getElementById('browser-iframe');
const urlBar = document.getElementById('safari-url');
const backBtn = document.getElementById('browser-back');
const bgm = document.getElementById('bgm');
const musicIcon = document.getElementById('music-desktop-icon');
const mailToast = document.getElementById('mail-toast');
const mailToastTitle = document.getElementById('mail-toast-title');
const mailToastBody = document.getElementById('mail-toast-body');

const globalPhoneTransition = document.getElementById('global-phone-transition');
const globalPhoneText = document.getElementById('global-phone-text');
const doorKnockAudio = document.getElementById('door-knock-audio');

let phoneDeliveryTimer = null;

function openSafari() {
    safariWin.classList.remove('phone-mode');
    safariWin.classList.add('active');
    iframe.src = 'pages/start_page.html';
    urlBar.innerText = '起始页';
    backBtn.style.display = 'none';
}

function openMailApp() {
    safariWin.classList.remove('phone-mode');
    safariWin.classList.add('active');
    iframe.src = 'pages/ouming_mail.html';
    urlBar.innerText = '邮件';
    backBtn.style.display = 'block';

    if (mailToast) {
        mailToast.style.display = 'none';
    }
}

function openDetectiveHub() {
    safariWin.classList.remove('phone-mode');
    safariWin.classList.add('active');
    iframe.src = 'pages/detective_hub.html';
    urlBar.innerText = 'Detective Hub';
    backBtn.style.display = 'block';
}

function openLinaixingPhone() {
    safariWin.classList.add('active');

    const unlocked = localStorage.getItem('linaixing_phone_unlocked') === '1';
    const phoneMode = localStorage.getItem('linaixing_phone_mode');

    if (unlocked) {
        if (phoneMode === 'real') {
            navigate('pages/phone/linaixing_phone_real_home.html', '林爱星的手机');
        } else {
            navigate('pages/phone/linaixing_phone_home.html', '林爱星的手机');
        }
    } else {
        navigate('pages/phone/linaixing_phone_lock.html', '林爱星的手机');
    }
}

function closePhoneMode() {
    safariWin.classList.remove('phone-mode');
    safariWin.classList.remove('active');
}

function closeSafari() {
    safariWin.classList.remove('phone-mode');
    safariWin.classList.remove('active');
}

function navigate(url, displayUrl) {
    iframe.src = url;
    urlBar.innerText = displayUrl || url;

    const isStartPage = url === 'pages/start_page.html';
    const isPhonePage = url.includes('pages/phone/');

    backBtn.style.display = isStartPage ? 'none' : 'block';

    if (isPhonePage) {
        safariWin.classList.add('phone-mode');
    } else {
        safariWin.classList.remove('phone-mode');
    }
}

function showMailToast(title, body) {
    if (!mailToast) return;

    mailToastTitle.innerText = title;
    mailToastBody.innerText = body;
    mailToast.style.display = 'block';

    clearTimeout(mailToast._timer);
    mailToast._timer = setTimeout(() => {
        mailToast.style.display = 'none';
    }, 5000);
}

function startPhoneCountdown() {
    if (localStorage.getItem('phone_arrived') === '1') return;
    if (localStorage.getItem('phone_delivery_started') === '1') return;

    localStorage.setItem('phone_delivery_started', '1');

    phoneDeliveryTimer = setTimeout(() => {
        triggerGlobalPhoneTransition();
    }, 60000);
}

function triggerGlobalPhoneTransition() {
    if (localStorage.getItem('phone_arrived') === '1') return;

    localStorage.setItem('phone_arrived', '1');

    const phoneDockItem = document.getElementById('phone-dock-item');
    if (phoneDockItem) {
        phoneDockItem.style.display = 'flex';
    }

    if (globalPhoneTransition) {
        globalPhoneTransition.style.display = 'flex';

        requestAnimationFrame(() => {
            globalPhoneTransition.classList.add('show');
        });
    }

    if (doorKnockAudio) {
        console.log('主页面：准备播放敲门声');

        doorKnockAudio.pause();
        doorKnockAudio.currentTime = 0;
        doorKnockAudio.muted = false;
        doorKnockAudio.volume = 1;

        const playPromise = doorKnockAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('主页面：敲门声开始播放');
            }).catch((err) => {
                console.log('主页面：敲门声音频播放失败', err);
            });
        }
    }

    setTimeout(() => {
        if (globalPhoneText) {
            globalPhoneText.classList.add('show');
        }
    }, 1600);

    setTimeout(() => {
        navigate('pages/phone/linaixing_phone_lock.html', '林爱星的手机');

        setTimeout(() => {
            if (globalPhoneTransition) {
                globalPhoneTransition.classList.remove('show');
                globalPhoneTransition.style.display = 'none';
            }
            if (globalPhoneText) {
                globalPhoneText.classList.remove('show');
            }
        }, 200);
    }, 5000);
}

window.addEventListener('message', (e) => {
    if (e.data.type === 'NAVIGATE') {
        navigate(e.data.url, e.data.displayUrl);

    } else if (e.data.type === 'UPDATE_URL') {
        urlBar.innerText = e.data.displayUrl;

    } else if (e.data.type === 'GO_TO_START') {
        navigate('pages/start_page.html', '起始页');

    } else if (e.data.type === 'NEW_MAIL') {
        if (e.data.mailKey === 'linqinnan' && localStorage.getItem('mail_linqinnan_unlocked') !== '1') {
            localStorage.setItem('mail_linqinnan_unlocked', '1');
            localStorage.setItem('mail_linqinnan_unread', '1');
            showMailToast('林琴楠', '关于我女儿林爱星的事，想拜托您调查');
        }

    } else if (e.data.type === 'START_PHONE_COUNTDOWN') {
        startPhoneCountdown();

    } else if (e.data.type === 'UNLOCK_AUDIO') {
        if (doorKnockAudio) {
            console.log('主页面：收到 UNLOCK_AUDIO，开始真实解锁音频');

            doorKnockAudio.pause();
            doorKnockAudio.currentTime = 0;
            doorKnockAudio.muted = false;
            doorKnockAudio.volume = 0.01;

            doorKnockAudio.play().then(() => {
                setTimeout(() => {
                    doorKnockAudio.pause();
                    doorKnockAudio.currentTime = 0;
                    doorKnockAudio.volume = 1;
                    console.log('主页面：音频解锁成功');
                }, 120);
            }).catch((err) => {
                console.log('主页面：音频解锁失败', err);
            });
        }

    } else if (e.data.type === 'UNLOCK_DETECTIVE_HUB') {
        localStorage.setItem('detective_hub_unlocked', '1');
        const detectiveDockItem = document.getElementById('detective-dock-item');
        if (detectiveDockItem) {
            detectiveDockItem.style.display = 'flex';
        }
    }
});

function handleBrowserBack() {
    const currentUrl = iframe.src;

    if (currentUrl.includes('start_page.html')) {
        return;
    }

    if (currentUrl.includes('ouming_mail.html')) {
        navigate('pages/start_page.html', '起始页');
        return;
    }

    iframe.contentWindow.postMessage({ type: 'BROWSER_BACK' }, '*');
}

let playing = false;
function toggleMusic() {
    if (!playing) {
        bgm.play();
    } else {
        bgm.pause();
    }
    playing = !playing;
}

window.addEventListener('DOMContentLoaded', () => {
    const detectiveDockItem = document.getElementById('detective-dock-item');
    if (detectiveDockItem) {
        detectiveDockItem.style.display =
            localStorage.getItem('detective_hub_unlocked') === '1' ? 'flex' : 'none';
    }

    const phoneDockItem = document.getElementById('phone-dock-item');
    if (phoneDockItem) {
        phoneDockItem.style.display =
            localStorage.getItem('phone_arrived') === '1' ? 'flex' : 'none';
    }
});

function unlockAudioOnce() {
    if (!doorKnockAudio) return;

    doorKnockAudio.play().then(() => {
        doorKnockAudio.pause();
        doorKnockAudio.currentTime = 0;
    }).catch(() => {});

    document.removeEventListener('click', unlockAudioOnce);
    document.removeEventListener('touchstart', unlockAudioOnce);
}

document.addEventListener('click', unlockAudioOnce);
document.addEventListener('touchstart', unlockAudioOnce);