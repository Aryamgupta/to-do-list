'use strict';

const mainScreen = document.querySelector('.main_section');
const formScreen = document.querySelector('.item_form_section');
const newItemBtn = document.querySelector('.new_button');
const addItemBtn = document.querySelector('.submit_btn');
const title = document.querySelector('.form_title');
const incompleteList = document.querySelector('.incomplete_item_section');
const completeList = document.querySelector('.complelte_item_section');
const des = document.querySelector('.form_des');
const itemDate = document.querySelector('input[type = "date"]');
const time = document.querySelector('input[type = "time"]');
const cancelBtn = document.querySelector('.cancle_btn');
const refersh = document.querySelector('.refersh_button');
const statusToggleSection = document.querySelector('.status_toggle_section');
const yesBtn = document.querySelector('.completed');
const noBtn = document.querySelector('.incompleted');
const clearBtn = document.querySelector('.clear_button');
let timeStringArray;
let city;

const date = new Date();

const even = new Date('11 19, 1975 23:15:30');

console.log(
  date,
  (date.getTime() - even.getTime()) / (1000 * 60 * 60 * 24 * 356)
);

// to get the city

const _getlocation = function () {
  if (navigator.geolocation) {
    const loc = navigator.geolocation.getCurrentPosition(
      _getCityName,
      function () {
        console.log('asda');
      }
    );
  }
};

const _getCityName = function (position) {
  let { latitude, longitude } = position.coords;

  const req = new XMLHttpRequest();

  req.open(
    'GET',
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );
  req.send();
  req.addEventListener('load', function () {
    city = JSON.parse(req.responseText).city;
    console.log(city);
  });
};

_getlocation();

// js for submit submit_btn

class Item {
  status;
  completed = false;
  constructor(title, des, itemDate, time, location) {
    this.title = title;
    this.des = des;
    this.itemDate = itemDate;
    this.time = time;
    this.location = location;
    this._getId();
    if (this._verfiedObject) {
      app.idData.push(this.id);

      this._setItemList();
    }
  }

  // to verify the true unique id is there  or not
  get _verfiedObject() {
    return !app.idData.includes(this.id) && this._timeRemaining > 0;
  }

  // to make the id of the object

  _getId() {
    this.id = `${this.title}${this.itemDate}${this.time}`;
    return 'id set';
  }
}

class CompletedItem extends Item {
  completed = true;
  constructor(title, des, itemDate, time, location) {
    super(title, des, itemDate, time, location);
    console.log(this);

    this._getId();

    // app.idData.push(this.id);
    // this._setItemList();
    // this._addItemOnCompleteList();
  }
}

class App {
  idData = [];
  data = [];
  completedData = [];

  constructor() {
    this._newBtn();
    this._addItem();
    this._cancelItem();
    this._refershItems();
    this._statusEditFunction();
    this._setingNoBtn();
    this._settingYesBtn();
    this._settingFromLocalStorage();
    clearBtn.addEventListener('click', this._resetAll);
  }

  _newBtn() {
    newItemBtn.addEventListener('click', function () {
      formScreen.classList.remove('none');

      title.value = des.value = itemDate.value = '';
      time.value = '22:00';
      itemDate.setAttribute(
        'min',
        `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, 0)}-${date.getDate()}`
      );
    });
  }

  _addItem = function () {
    addItemBtn.addEventListener('click', function () {
      formScreen.classList.add('none');
      // to check the null items
      if (
        itemDate.value === '' ||
        time === '' ||
        title.value.toString().length <= 2
      ) {
        return alert('Error Occured');
      }

      // to check repeated items

      let item = new Item(
        title.value,
        des.value,
        itemDate.value,
        time.value,
        city
      );
      // item.prototype ;
      app._renderItems(item);
      // item.prototype = Item;
      app.data.push(item);

      console.log(item);

      app._localStorageSettingIncomplete();

      console.log(app.data);
    });
  };

  _renderItems = item => {
    incompleteList.insertAdjacentHTML('beforeend', this._sethtml(item));
    this._timeString(item);
  };

  _sethtml = item => {
    const html = `<li class="to_do_list_item" itemid= "${item.id}">
          <div>
            <h2 class="item_title">${item.title}</h2>
            <div class="item_itemDate_time">
              <h3 class="Date">${item.itemDate}</h3>
              <h3 class="time">${item.completed ? '' : item.time}</h3>
            </div>
            <p class="item_des">
              ${item.des}
            </p>
            <div class="location_time_left">
              <h4 class="location">${item.location}</h4>
              <h4 class="timeString" idval = "${item.id}"> Remaining</h4>
            </div>
          </div>
        </li>`;
    return html;
  };

  // to set the time string that  will be displayed
  _timeString = item => {
    let timeRemain = this._timeRemaining(item);
    let days = Math.abs(Math.trunc(timeRemain / (1000 * 60 * 60 * 24)));
    let hours = Math.abs(Math.trunc(timeRemain / (1000 * 60 * 60)));
    let min = Math.abs(Math.trunc(timeRemain / (1000 * 60)));

    let exp, status;

    if (timeRemain > 0) {
      status = 'Remaining';
      exp = item.completed
        ? 'DONE EARLY'
        : this._setDHM(
            days,
            'Day',
            hours,
            'Hour',
            min,
            'Minute',
            status,
            1,
            1,
            true
          );
    }
    if (timeRemain < 0) {
      status = item.completed ? 'Ago' : 'Delay';

      exp = `${item.completed ? 'Completed' : ''} ${this._setDHM(
        min,
        'Minute',
        hours,
        'Hour',
        days,
        'Day',
        status,
        60,
        24,
        false
      )}`;
    }
    this._setTimeStringInnerHTML(exp, item);
  };

  _setTimeStringInnerHTML = (ex, item) => {
    let varArray = document.querySelectorAll('.timeString');
    varArray.forEach(function (val) {
      if (val.getAttribute('idval') === item.id) {
        val.innerHTML = `${ex}`;
      }
    });
  };

  _setDHM = (x, x1, y, y1, z, z1, k, c1, c2, s) => {
    let e;
    e = this._sets(x, x1, k);

    if (s ? x < c1 : x > c1) {
      e = this._sets(y, y1, k);
    }
    if (s ? y < c2 : y > c2) {
      e = this._sets(z, z1, k);
    }
    return e;
  };

  _sets = (x, y, z) => {
    return `${x} ${y}${x < 2 ? '' : 's'} ${z}`;
  };

  _timeRemaining = item => {
    let recentDate = new Date();

    let secDate = new Date(
      `${item.itemDate.toString().slice(5, 7)} ${item.itemDate
        .toString()
        .slice(8, 10)}, ${item.itemDate.toString().slice(0, 4)} ${item.time}:00`
    );

    return secDate.getTime() - recentDate.getTime();
  };

  _cancelItem() {
    cancelBtn.addEventListener('click', function () {
      formScreen.classList.add('none');
      title.value = des.value = itemDate.value = time.value = '';
    });
  }

  _refershItems() {
    refersh.addEventListener(
      'click',
      function () {
        this._refershItemsHelper(this.data);
        this._refershItemsHelper(this.completedData);
      }.bind(this)
    );
  }

  _refershItemsHelper(data) {
    data.forEach(
      function (item) {
        console.log(item);

        this._timeString(item);
      }.bind(this)
    );
  }

  _statusEditFunction() {
    incompleteList.addEventListener('click', function (e) {
      if (
        e.target.parentNode
          .closest('.to_do_list_item')
          .getAttribute('itemid') !== null
      ) {
        yesBtn.setAttribute(
          'itemKey',
          `${e.target.parentNode
            .closest('.to_do_list_item')
            .getAttribute('itemid')}`
        );
        console.log(yesBtn.getAttribute('itemKey'));
        statusToggleSection.classList.remove('none');
      }
    });
  }

  _settingYesBtn() {
    yesBtn.addEventListener('click', function (e) {
      let itemListIncomplete = document.querySelectorAll('.to_do_list_item');
      itemListIncomplete.forEach(
        function (item) {
          if (item.getAttribute('itemid') === this.getAttribute('itemKey')) {
            item.parentNode.removeChild(item);
            // console.log(item);
          }
        }.bind(this)
      );

      statusToggleSection.classList.add('none');
      let clickedItem = app._toGetParticularObject(
        this.getAttribute('itemKey')
      );

      app.data.splice(app.data.indexOf(clickedItem), 1);
      console.log(app.data);

      let completedItemClass = new CompletedItem(
        clickedItem.title,
        clickedItem.des,
        clickedItem.itemDate,
        clickedItem.time,
        clickedItem.location
      );

      app._addItemOnCompleteList(completedItemClass);

      app.completedData.push(completedItemClass);
      app._localStorageSettingcomplete();

      app._localStorageSettingIncomplete();
      console.log(app.completedData, app.data);
    });
  }

  _addItemOnCompleteList = item => {
    completeList.insertAdjacentHTML('beforeend', this._sethtml(item));
    this._timeString(item);
  };

  _setingNoBtn() {
    noBtn.addEventListener('click', function () {
      statusToggleSection.classList.add('none');
    });
  }

  _toGetParticularObject(id) {
    let object;
    this.data.forEach(function (obj) {
      if (id == obj.id) {
        object = obj;
      }
    });
    return object;
  }

  _localStorageSettingIncomplete() {
    let incompleteItemList = JSON.stringify(this.data);

    localStorage.setItem('incompleted', incompleteItemList);
  }

  _localStorageSettingcomplete() {
    let completeItemList = JSON.stringify(this.completedData);
    console.log(completeItemList);

    localStorage.setItem('completed', completeItemList);
    console.log(localStorage.getItem('completed'));
  }

  _settingFromLocalStorage() {
    if (localStorage.getItem('incompleted'))
      this.data = JSON.parse(localStorage.getItem('incompleted'));
    if (localStorage.getItem('completed')) {
      this.completedData = JSON.parse(localStorage.getItem('completed'));
    }
    console.log(this.completedData);

    if (!this.data && !this.completedData) return;

    this.data.forEach(
      function (item) {
        this._renderItems(item);
      }.bind(this)
    );

    this.completedData.forEach(
      function (i) {
        this._addItemOnCompleteList(i);
      }.bind(this)
    );
  }

  _resetAll = () => {
    this.data = [];
    console.log(this.data);
    document.querySelectorAll('.to_do_list_item').forEach(function (li) {
      li.parentNode.removeChild(li);
    });

    localStorage.removeItem('incompleted');
    localStorage.removeItem('completed');
  };
}

const app = new App();
