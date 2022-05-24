//////////////share
function navigateHighLight(){
  let currUrl = window.location.href.split('/')
  currUrl = currUrl[currUrl.length - 1]

  if(currUrl == ''){
    document
      .querySelector('.left_navbar-item.dashboard')
      .setAttribute('selected_nav', true)
  }else{
    const target = `.left_navbar-item.${currUrl}`
    document.querySelector(target).setAttribute('selected_nav', true)
  }

}

const layout = document.querySelector('.my_container')
if(layout){
  navigateHighLight()

  function handleSignOut(){
    console.log('aloo')
    fetch('/users/logout', {
      method: 'post',
      redirect: "follow"
    })
    .then(res => res.json())
    .then(data => {
      if(data.code === 0){
        
        window.location.href = '/login'
      }
        
    })
  }
}
  

function handleNavigate(div){
  const navTo = div.querySelector('.left_navbar-title').innerText

  //xu li hieu ung chon
  
  
  //chuyen trang
  if(navTo == 'Dash Board'){
    window.location.href = "/"
  }
   
  if(navTo == 'Dep/Wdr')
    window.location.href = "/deposit_withdraw"
  if(navTo == 'Profile')
    window.location.href = "/profile"
  if(navTo == 'Transfer')
    window.location.href = "/transfer"
  if(navTo == 'Buy Cards')
    window.location.href = "/buy_cards"
}

$("input[data-type='currency']").on({
  keyup: function() {
    formatCurrency($(this));
  },
  blur: function() { 
    formatCurrency($(this), "blur");
  }
});


function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }


  function formatCurrency(input, blur) {
  // appends $ to value, validates decimal side
  // and puts cursor back in right position.

  // get input value
  var input_val = input.val();

  // don't validate empty input
  if (input_val === "") { return; }

  // original length
  var original_len = input_val.length;

  // initial caret position 
  var caret_pos = input.prop("selectionStart");
    
  // check for decimal
  if (input_val.indexOf(".") >= 0) {

    // get position of first decimal
    // this prevents multiple decimals from
    // being entered
    var decimal_pos = input_val.indexOf(".");

    // split number by decimal point
    var left_side = input_val.substring(0, decimal_pos);
    var right_side = input_val.substring(decimal_pos);

    // add commas to left side of number
    left_side = formatNumber(left_side);

    // validate right side
    right_side = formatNumber(right_side);
    
    // On blur make sure 2 numbers after decimal
    if (blur === "blur") {
      right_side += "00";
    }
    
    // Limit decimal to only 2 digits
    right_side = right_side.substring(0, 2);

    // join number by .
    input_val = "" + left_side + "." + right_side;

  } else {
    // no decimal entered
    // add commas to number
    // remove all non-digits
    input_val = formatNumber(input_val);
    input_val = "" + input_val;
    
    //final formatting
    if (blur === "blur") {
      input_val += " VND";
    }
  }

  // send updated string to input
  input.val(input_val);

  // put caret back in the right position
  var updated_len = input_val.length;
  caret_pos = updated_len - original_len + caret_pos;
  input[0].setSelectionRange(caret_pos, caret_pos);
}


function convertMoneyAmount(text){
  const myStr = text.trim().split(' ')[0]
  const strArr = myStr.split(',')
  let intStr = ''

  strArr.forEach(str => {
    intStr += str
  })

  return parseInt(intStr)
}


///////format money function
function convertToStr(number){
  let formatedArr = []
	
  function formatMoney(amount){

    amount = parseInt(amount)

    if(amount < 1) return formatedArr

    formatedArr.push(amount%1000)

    return formatMoney(amount/1000)
  }
  
  const temp = formatMoney(number)
  let str = ''
  const lastIndex = temp.length - 1
  let count = 0

  temp.forEach(digit => {
    const lenDigit = digit.toString().length

    if(count === lastIndex){
      str = digit + ',' + str
    }else{
      if(digit === 0){
        str = '000,' + str
      }
      else if(digit <= 9){
        str = '00' + digit + ',' + str
      }
      else if(digit <= 99){
        str = '0' + digit + ',' + str
      }

      else
        str = digit + ',' + str
    }

    count ++
  })
	
  return str.slice(0, str.length - 1)
}

///////////////////////DASHBOARD
const dashboard = document.querySelector('.content_index')
if(dashboard){
  function viewTransferDetailInfo(){
    $('#transferDetail').modal('show')
  }
}




/////////////////////////PROFILE
const profile = document.querySelector('.account_content')
if(profile){
    function handleUpdateInfo(icon){
        console.log(icon.parentElement.innerText)
        //return icon.parentElement.innerText
    }   
}

////////////////////////TRANSFER
const transfer = document.querySelector('.transfer_content')

if(transfer){
    const searchInput = document.querySelector('.payee_box-input_holder')
    searchInput.addEventListener('input', function(e) {
      const value = e.target.value;
      if (value !== '') {
        fetch(`http://localhost:3000/search/${value}`, {
          method: 'POST',
        })
        .then(res => res.json())
        .then(response => {
          const usersList = document.querySelector('.payee_box-accounts_users')
          usersList.innerHTML = ``;
          if (response.code == 0) {
            response.data.forEach(user => {
              usersList.innerHTML += `<div class="payee_box-accounts_users-wrapper" onclick="handleChooseAccount(this)">
              <div class="accounts_users-item">
              <img class = "accounts_users-item_img" src="images/avatar/unknown_male.png" alt="avatar">
              </div>
              <div class="accounts_users-item_info">
              <p class="accounts_users-item_name">${user.username}</p>
              <p class="accounts_users-item_id text-warning">#${user._id}</p>
              </div>
              </div>`
            })
          }
        })
      }
    })
    function resetSearch(){
      const searchInput = document.querySelector('.payee_box-input_holder')

      searchInput.value = ''
    }

    //choose account -> render id
    function handleChooseAccount(icon){
      const user_id = icon.querySelector('.accounts_users-item_id.text-warning').innerHTML
      
      document.querySelector('.transfer_box-form_input.user_id').value = user_id
    }
    
    let dataBodyFetch = {}

    //pop up transfer modal
    function handleTransfer(){
      const user_id = document.querySelector('.transfer_box-form_input.user_id').value
      const amount  = document.querySelector('.transfer_box-form_input.money_amount').value
      const renderTotal = document.querySelector('.transfer-confirm_total')
      const renderMsg = document.querySelector('.transfer_box-invalid_input')
      const renderFee = document.querySelector('.transfer-confirm_total.transfer-confirm_fee')
      
      renderTotal.innerText = ''
      renderMsg.innerText = ''
      renderFee.innerText = ''

      const amount_str = amount.split(' ')[0]
      
      const str_arr = amount_str.split(',')
      let amount_int = ""

      str_arr.forEach(str => {
        amount_int += str
      })

      if(!user_id || !amount_str){
        renderMsg.innerText = 'Thiếu số tiền càn chuyển'
        
      }else{
        
        let transfer_int = parseInt(amount_int)
        let feeTransfer = Math.ceil(transfer_int*5/100)

        dataBodyFetch = {actor: localStorage.getItem('accessToken')}

        transfer_int = convertToStr(transfer_int)
        feeTransfer = convertToStr(feeTransfer)

        renderTotal.innerText = `${transfer_int} VND`
        renderFee.innerText = `${feeTransfer} VND`
        fetch('http://localhost:3000/wallet/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataBodyFetch)
        })
        .then(res => res.json())
        .then(response => {
          console.log(response)
          $('#transferModal').modal('show')
        })
      }
      
    }

    //handle confirm transfer
    function confirmedTransfer(){

      //check xem PIN dung chua

      //fetch api
      const chargedAccount = document.querySelector('input[name="fee_payer"]:checked').value

      dataBodyFetch = {...dataBodyFetch, chargedAccount}

      console.log(dataBodyFetch)
      console.log('xu li confirm transfer', dataBodyFetch)
    }
}



///////BUY CARDS
const buy_cards = document.querySelector('.buy_cards-content')

if(buy_cards){

  let cardsSameType = []
  const countSpan = document.querySelector('.header_box-count_number')
  let validType = ''
  const purchaseBtn = document.querySelector('.buy_cards-btn')

  //
  function turnOnSelection(tag){
    const type = tag.getAttribute('card_type')
    const value = tag.innerText
    const updateQuantity = tag.querySelector('.item_list-item_quantity')

    if(cardsSameType.length === 5) return

    if(cardsSameType.length === 0){
      validType = type
      tag.setAttribute('class', 'item_list-item selected')
      cardsSameType.push({type, value: convertMoneyAmount(value)})
      countSpan.innerText = cardsSameType.length
      updateQuantity.innerText = 1

    }else{
      // const selected = tag.getAttribute('class').split(' ')[1]
      // if(selected){
      //   updateQuantity.innerText = parseInt(updateQuantity.innerText) + 1
      // }
      if(type != validType) return

      tag.setAttribute('class', 'item_list-item selected')
      cardsSameType.push({type, value: convertMoneyAmount(value)})
      updateQuantity.innerText = parseInt(updateQuantity.innerText) + 1
      countSpan.innerText = cardsSameType.length
    }
    
    renderCardInfo()
  }

  //
  const cardList = document.querySelector('.bill_list-item_card_list')
  const totalSpan = document.querySelector('.bill_list-total_amount')
  const confirmAmount = document.querySelector('.bill_list-confirm_total')

  function resetSelection(){
    cardsSameType = []
    const tags = document.querySelectorAll('.item_list-item')
    const quanities = document.querySelectorAll('.item_list-item_quantity')
    const networkProvider = document.querySelector('.bill_list-item_span.phone_network')
    
    tags.forEach(tag => {
      tag.setAttribute('class', 'item_list-item')
    })

    quanities.forEach(quantity => {
      quantity.innerText = 0
    })
    
    countSpan.innerText = 0

    cardList.innerHTML = ''

    totalSpan.innerText = '0 VND'

    networkProvider.innerHTML = ''

    purchaseBtn.setAttribute('disabled', true)
  }

  //
  function renderCardInfo(){
    
    cardList.innerHTML = ''

    const phoneNetwork = document.querySelector('.bill_list-item_span.phone_network')
    const network = cardsSameType[0].type
    
    purchaseBtn.removeAttribute('disabled')
    phoneNetwork.innerText = network

    let sum = 0
    cardsSameType.forEach(card => {
      const cardItem = document.createElement('div')
      cardItem.setAttribute('class', 'bill_list-item_card')

      //const randomSerie = createRandomSerie(network)
      const renderValue = convertToStr(card.value)

      cardItem.innerHTML = `
        <p>${card.type}</p>
        <p>${renderValue} VND</p>`

      cardList.appendChild(cardItem)

      sum += card.value
    })
    
    const renderSum = convertToStr(sum)
    totalSpan.innerText = `${renderSum} VND`
    confirmAmount.innerText = `${renderSum} VND`
  }

  function createRandomSerie(network){
    let myNumber = ''
    const lastDigits = Math.floor(Math.random()*90000) + 10000

    if(network == 'Viettel'){
      myNumber = '11111' + lastDigits.toString()
    }

    if(network == 'Mobifone'){
      myNumber = '22222' + lastDigits.toString()
    }

    if(network == 'Vinaphone'){
      myNumber = '33333' + lastDigits.toString()
    }

    return myNumber
  }

  function handlePurchase(){
    const quantity = cardList.childElementCount
    const internetService = cardsSameType[0].type
    let sum = 0;
    cardsSameType.forEach(card => {
      sum += card.value
    })
    purchaseFetchBody = {
      internetService: internetService,
      quantity: quantity,
      totalCost: sum,
      actor: localStorage.getItem('accessToken')
    }
    console.log(purchaseFetchBody)
    fetch('http://localhost:3000/wallet/purchasePhoneCard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purchaseFetchBody)
    })
    .then(res => res.json())
    .then(response => {
      console.log(response)
      if (response.code === 0) {
        const phoneCards = document.querySelector('.purchase_success-box')
        phoneCards.innerHTML = ``
        response.cards.forEach(card => {
          phoneCards.innerHTML += `<h6 class="purchase_success-box_title">${card} - ${response.internetService}</h6>`
        })
      }
      $('#exampleModalCenter').modal('hide')
    })
    $('#manap').modal('show')
    
  }
}

///////////////DEPOSIT_WITHDRAW/////////
const dep_with = document.querySelector('.dep_with-content')
if(dep_with){

  function validateCashIn(cardNo, cvv, dateExp, amount){
    let errs = []
    cardNo = cardNo.toString()
    cvv = cvv.toString()

    if(!cardNo){
      errs.push({type: 1, msg: 'Missing card number info'})
    }
    if(cardNo.length !== 6 && cardNo.length > 0)
      errs.push({type: 1, msg: 'Card number must have 6 digits'})

    if(!cvv){
      errs.push({type: 2, msg: 'Missing cvv info'})
    }
    if(cvv.length !== 3 && cvv.length > 0){
      errs.push({type: 2, msg: 'CVV code must have 3 digits'})
    }

    const expDate = new Date(dateExp)
    const nowDate = Date.now()
    
    if(!dateExp)
      errs.push({type: 3, msg: 'Missing card expire date'})

    if(expDate < nowDate){
      errs.push({type: 3, msg: 'Card expired!'})
    }
    
    if(!amount)
      errs.push({type: 4, msg: 'Missing amount'})
    
    
      return errs
  }

  //api cash in here
  let cashInFetchBody = {}

  function handleCashIn(){
    //err span
    const errCardNo = document.querySelector('.cardnum_err')
    const errCvv = document.querySelector('.cvv_err')
    const errExp = document.querySelector('.expdate_err')
    const errAmount = document.querySelector('.amount_err')
    
    //reset state
    let errors = []
    errCardNo.innerText = ''
    errCvv.innerHTML = ''
    errExp.innerHTML = ''
    errAmount.innerHTML = ''

    //get input values
    const cardNo = document.querySelector('#cash_in_cardnum').value
    const cvv = document.querySelector('#cash_in_cvv').value
    const expDate = document.querySelector('#cash_in_exp').value
    const moneyAmount = document.querySelector('#cash_in_amount').value
    const intAmount = parseInt(convertMoneyAmount(moneyAmount))

    errors = validateCashIn(cardNo, cvv, expDate, moneyAmount)

    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1){
          errCardNo.innerText = err.msg
        }
        else if(err.type === 2){
          errCvv.innerHTML = err.msg
        }
        else if(err.type === 3)
          errExp.innerHTML = err.msg
        else
          errAmount.innerHTML = err.msg
      })
    }else{
      
      const accessToken = localStorage.getItem('accessToken')
      cashInFetchBody = {
        creditCardNumber: cardNo, 
        cvvCode: cvv,
        expirationDate: expDate,
        money: intAmount, 
        actor: accessToken
      }
      fetch('http://localhost:3000/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cashInFetchBody) 
      })
      .then(res => res.json())
      .then(response => {
        if (response.code == 0) {
          document.querySelector('.balance_box-amount').textContent = response.data.accountBalance
        }
      })
    }
  }

  //handle cash out
  let cashOutFetchBody = {}

  function handleCashOut(){
    //err span
    const errCardNo = document.querySelector('.cardnum_err.withdraw')
    const errCvv = document.querySelector('.cvv_err.withdraw')
    const errExp = document.querySelector('.expdate_err.withdraw')
    const errAmount = document.querySelector('.amount_err.withdraw')
    const errLastValidate = document.querySelector('.last_err.withdraw')

    //reset state
    let errors = []
    errCardNo.innerText = ''
    errCvv.innerHTML = ''
    errExp.innerHTML = ''
    errAmount.innerHTML = ''
    errLastValidate.innerHTML = ''

    //get input values
    const cardNo = document.querySelector('#cash_out_cardnum').value
    const cvv = document.querySelector('#cash_out_cvv').value
    const expDate = document.querySelector('#cash_out_exp').value
    const moneyAmount = document.querySelector('#cash_out_amount').value
    const intAmount = parseInt(convertMoneyAmount(moneyAmount))
    const withdrawNo = document.querySelector('.withdraw_inform-count').innerText
    const msg = document.querySelector('#cash_out_msg').value

    errors = validateCashIn(cardNo, cvv, expDate, moneyAmount)

    if(parseInt(withdrawNo) >= 2){
      errLastValidate.innerHTML = 'Too much number of withdraws a day!'
    }
    else if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1){
          errCardNo.innerText = err.msg
        }
        else if(err.type === 2){
          errCvv.innerHTML = err.msg
        }
        else if(err.type === 3)
          errExp.innerHTML = err.msg
        else
          errAmount.innerHTML = err.msg
      })
    }else{
      
      if(intAmount % 50000 != 0){
        errAmount.innerHTML = 'Money amount is not multiple of 50000'
      }
      
      else{
        // const renderTotal = document.querySelector('.withdraw-confirm_total')
        // const total = convertToStr(parseInt(intAmount + (intAmount*5/100)))

        // renderTotal.innerHTML = `${total} VND`
        // $('#withdrawModal').modal('show')
        cashOutFetchBody = {
          creditCardNumber: cardNo, 
          cvvCode: cvv, 
          expirationDate: expDate, 
          money: intAmount, 
          message:msg,
          actor: localStorage.getItem('accessToken')
        }
        console.log(cashOutFetchBody);
        fetch('http://localhost:3000/wallet/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cashOutFetchBody)
        })
        .then(res=> res.json())
        .then(response => {
          console.log(response)
        })
      }
    
    }
  }

  //api cash out here
  function handleWithdraw(){
    console.log('cash out here', cashOutFetchBody)
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

////////////////////////LOGIN
const login = document.querySelector('.login_content')
if(login){


  function validateLogin(username, password){
    let errors = []
    username = username.toString()
    if(!username){
      errors.push({type: 1, msg: 'Missing username'})
    }
    if(username.length !== 10 && username.length !== 0){
      errors.push({type: 1, msg: 'Username is a string of 10 digits'})
    }

    if(!password){
      errors.push({type: 2, msg: 'Missing password'})
    }
    if(password.length < 6 && password.length !== 0){
      errors.push({type: 2, msg: 'At least 6 char for password'})
    }

    return errors
  }


  function handleLogin(){
    const username = document.querySelector('#login_box-username').value
    const password = document.querySelector('#login_box-password').value
    const renderLast = document.querySelector('.login_box-msg.last')
    const renderUsername = document.querySelector('.login_box-msg.username')
    const renderPass = document.querySelector('.login_box-msg.pass')

    renderLast.innerText = ''
    renderUsername.innerText = ''
    renderPass.innerText = ''

    const errors = validateLogin(username, password)
    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1){
          renderUsername.innerText = err.msg
        }else{
          renderPass.innerText = err.msg
        }
      })
    }
    else{
      console.log('in here')
      fetch('/users/login', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username, password
        }),
        redirect: 'follow'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if(data.code === 0){
          const status = data.status_for_direct

          localStorage.setItem('accessToken', data.accessToken)
          return status //good to go 
        }
        return data.msg
      })
      .then(lastRes => {
        if(lastRes === -1){
          renderLast.innerText = 'Your password has been deactivated, please contact 18001008'
        }
        else if(lastRes === 0){
          window.location.href = '/first_change'
        }
        else if(lastRes >= 1)
          window.location.href = '/'
        
        else{
          renderLast.innerText = lastRes
        }
      })
    }
    
    
  }
}

//////////////FORGET PASS
const forget_pass = document.querySelector('.login_content.forget_pass')
if(forget_pass){

  function handleForgetPass(){

    const email = document.querySelector('#forget_pass-email').value
    const phoneNumber = document.querySelector('#forget_pass-phone_num').value
    const pass = document.querySelector('#forget_pass-new_pass').value
    const confirmPass = document.querySelector('#forget_pass-reenter_pass').value

    //console.log(email, phoneNumber, pass, confirmPass)


    ////validate xong roi moi cho phep fetch
    fetch('users/forgetPassword', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, phoneNumber, pass, confirmPass})
    })
    .then(res => res.json())
    .then(data => {
      //data.code !== 0 => render loi ra day
      console.log(data)
    })
  }
}


/////////////CHANGE PASS
const change_pass = document.querySelector('.change_pass')
if(change_pass){
  function handleChangePass(){
    const oldPassword = document.querySelector('#change_pass-old_pass').value
    const newPassword = document.querySelector('#change_pass-new_pass').value
    const confirmPassword = document.querySelector('#change_pass-reenter_pass').value
    const authToken = `Bearer ${localStorage.getItem('accessToken')}`
    
    //console.log(oldPassword, newPassword, confirmPassword)
    //////validate

    //console.log('accessToken', localStorage.getItem('accessToken'))

    //////validate thanh cong thi moi duoc fetch
    fetch('/users/changePassword', {
      method: 'put',
      headers: {
        'Authorization' : authToken,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        oldPassword, newPassword, confirmPassword
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if(data.code === 0){
        window.location.href = '/'
      }
      //else render loi data.msg ra giao dien
    })
  }
}

///////////////first change
const first_change = document.querySelector('.first_change')
if(first_change){
  function handleFirstChange(){
    const newPassword = document.querySelector('#first_change-new_pass').value
    const confirmPassword = document.querySelector('#first_change-reenter_pass').value
    const authToken = `Bearer ${localStorage.getItem('accessToken')}`

    console.log(newPassword, confirmPassword, authToken)
    
    //validate xong moi duoc fetch
    fetch('http://localhost:3000/users/changePassword/firstLogin', {
      method: 'put',
      headers: {
        'Authorization': authToken,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({newPassword, confirmPassword})
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if(data.code === 0){
        window.location.href = '/'
      }
    })
  }
}

const pendingPage = document.querySelector('#waiting-content')
if (pendingPage) {
  fetch('http://localhost:3000/admin/pending')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const pendingAccountsList = document.querySelector('.pending_accounts-list')
      pendingAccountsList.innerHTML = ``
      response.data.forEach((account) => {
        console.log(account)
        pendingAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${account.createdAt}
                    </p>
                </div>
                <button type="button" class="container_btn--primary btn btn-outline-success p-2" data-bs-toggle="modal" data-bs-target="#staticBackdrop"><i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Xác minh</button>
                <button type="button" class="container_btn--primary btn btn-outline-danger p-2" data-bs-toggle="modal" data-bs-target="#staticBackdropRefuse"><i style="margin-right: 6px;" class="fa-solid fa-x"></i></i>Hủy</button>
                <button type="button" class="container_btn--primary btn btn-outline-warning p-2" data-bs-toggle="modal" data-bs-target="#staticBackdropRefuse"><i style="margin-right: 6px;" class="fa-solid fa-file"></i></i>Yêu cầu bổ sung thông tin</button>
                <button  onclick="handleProfile('${account._id}')" id="pending_accounts-profile-btn" type="button" class="container_btn--primary btn btn-outline-info p-2" data-bs-toggle="modal" data-bs-target="#profile"><i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết</button>
            </div>`
      })
    }
  })

  function handleProfile(id) {
    fetch(`http://localhost:3000/admin/search/${id}`)
    .then(res => res.json())
    .then(response => {
      console.log(response)
      const profileModal = document.querySelector('#profile')
      const userName = profileModal.querySelector('#pending_accounts-username')
      const email = profileModal.querySelector('#pending_accounts-email')
      const address = profileModal.querySelector('#pending_accounts-address')
      const frontId = profileModal.querySelector('#pending_accounts-front-id')
      const backId = profileModal.querySelector('#pending_accounts-back-id')
      const name = profileModal.querySelector('#pending_accounts-name')
      const phone = profileModal.querySelector('#pending_accounts-phone')
      const birthDay = profileModal.querySelector('#pending_accounts-birthday')
      userName.innerText = response.data.username ||'';
      email.innerText = response.data.email || '';
      address.innerText = response.data.address || '';
      frontId.setAttribute('src', response.data.id_front || '')
      backId.setAttribute('src', response.data.id_back || '')
      name.innerText = response.data.hoten;
      phone.innerText = response.data.phonenumber;
      birthDay.innerText = response.data.birth
    })
  }
}

const activatedPage = document.querySelector('#activated-content')
if (activatedPage) {
  fetch('http://localhost:3000/admin/fulfilled')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const activatedAccountsList = document.querySelector('.activated_accounts-list')
      activatedAccountsList.innerHTML = ``
      response.data.forEach((account) => {
        console.log(account)
        activatedAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${account.createdAt}
                    </p>
                </div>
                <button type="button" class="container_btn--primary btn btn-success p-2"><i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Xác minh</button>
                <button  onclick="handleProfile('${account._id}')" id="pending_accounts-profile-btn" type="button" class="container_btn--primary btn btn-outline-info p-2" data-bs-toggle="modal" data-bs-target="#profile"><i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết</button>
            </div>`
      })
    }
  })

  function handleProfile(id) {
    fetch(`http://localhost:3000/admin/search/${id}`)
    .then(res => res.json())
    .then(response => {
      console.log(response)
      const profileModal = document.querySelector('#profile')
      const userName = profileModal.querySelector('#pending_accounts-username')
      const email = profileModal.querySelector('#pending_accounts-email')
      const address = profileModal.querySelector('#pending_accounts-address')
      const frontId = profileModal.querySelector('#pending_accounts-front-id')
      const backId = profileModal.querySelector('#pending_accounts-back-id')
      const name = profileModal.querySelector('#pending_accounts-name')
      const phone = profileModal.querySelector('#pending_accounts-phone')
      const birthDay = profileModal.querySelector('#pending_accounts-birthday')
      userName.innerText = response.data.username ||'';
      email.innerText = response.data.email || '';
      address.innerText = response.data.address || '';
      frontId.setAttribute('src', response.data.id_front || '')
      backId.setAttribute('src', response.data.id_back || '')
      name.innerText = response.data.hoten;
      phone.innerText = response.data.phonenumber;
      birthDay.innerText = response.data.birth
    })
  }
}

const banPage = document.querySelector('#ban-content')
if (banPage) {
  fetch('http://localhost:3000/admin/lock')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const banAccountsList = document.querySelector('.ban_accounts-list')
      banAccountsList.innerHTML = ``
      response.data.forEach((account) => {
        console.log(account)
        banAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${account.createdAt}
                    </p>
                </div>
                <button type="button" class="container_btn--primary btn btn-success p-2"><i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Xác minh</button>
                <button  onclick="handleProfile('${account._id}')" id="pending_accounts-profile-btn" type="button" class="container_btn--primary btn btn-outline-info p-2" data-bs-toggle="modal" data-bs-target="#profile"><i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết</button>
            </div>`
      })
    }
  })

  function handleProfile(id) {
    fetch(`http://localhost:3000/admin/search/${id}`)
    .then(res => res.json())
    .then(response => {
      console.log(response)
      const profileModal = document.querySelector('#profile')
      const userName = profileModal.querySelector('#pending_accounts-username')
      const email = profileModal.querySelector('#pending_accounts-email')
      const address = profileModal.querySelector('#pending_accounts-address')
      const frontId = profileModal.querySelector('#pending_accounts-front-id')
      const backId = profileModal.querySelector('#pending_accounts-back-id')
      const name = profileModal.querySelector('#pending_accounts-name')
      const phone = profileModal.querySelector('#pending_accounts-phone')
      const birthDay = profileModal.querySelector('#pending_accounts-birthday')
      userName.innerText = response.data.username ||'';
      email.innerText = response.data.email || '';
      address.innerText = response.data.address || '';
      frontId.setAttribute('src', response.data.id_front || '')
      backId.setAttribute('src', response.data.id_back || '')
      name.innerText = response.data.hoten;
      phone.innerText = response.data.phonenumber;
      birthDay.innerText = response.data.birth
    })
  }
}

const deactivatedPage = document.querySelector('#deactivated-content')
if (deactivatedPage) {
  fetch('http://localhost:3000/admin/rejected')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const deactivatedAccountsList = document.querySelector('.deactivated_accounts-list')
      deactivatedAccountsList.innerHTML = ``
      response.data.forEach((account) => {
        console.log(account)
        deactivatedAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${account.createdAt}
                    </p>
                </div>
                <button type="button" class="container_btn--primary btn btn-success p-2"><i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Xác minh</button>
                <button  onclick="handleProfile('${account._id}')" id="pending_accounts-profile-btn" type="button" class="container_btn--primary btn btn-outline-info p-2" data-bs-toggle="modal" data-bs-target="#profile"><i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết</button>
            </div>`
      })
    }
  })

  function handleProfile(id) {
    fetch(`http://localhost:3000/admin/search/${id}`)
    .then(res => res.json())
    .then(response => {
      console.log(response)
      const profileModal = document.querySelector('#profile')
      const userName = profileModal.querySelector('#pending_accounts-username')
      const email = profileModal.querySelector('#pending_accounts-email')
      const address = profileModal.querySelector('#pending_accounts-address')
      const frontId = profileModal.querySelector('#pending_accounts-front-id')
      const backId = profileModal.querySelector('#pending_accounts-back-id')
      const name = profileModal.querySelector('#pending_accounts-name')
      const phone = profileModal.querySelector('#pending_accounts-phone')
      const birthDay = profileModal.querySelector('#pending_accounts-birthday')
      userName.innerText = response.data.username ||'';
      email.innerText = response.data.email || '';
      address.innerText = response.data.address || '';
      frontId.setAttribute('src', response.data.id_front || '')
      backId.setAttribute('src', response.data.id_back || '')
      name.innerText = response.data.hoten;
      phone.innerText = response.data.phonenumber;
      birthDay.innerText = response.data.birth
    })
  }
}