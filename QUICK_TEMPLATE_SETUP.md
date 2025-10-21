# ⚡ Quick EmailJS Template Setup

## 🚀 5-Minute Setup

### 1. Create Template in EmailJS Dashboard

Go to: https://dashboard.emailjs.com/admin/templates

Click **"Create New Template"**

### 2. Template Settings

**Template Name:** `Portfolio Contact Form`

**Subject Line:**
```
New Contact: {{subject}}
```

**Set Reply-To:**
```
{{from_email}}
```

### 3. Copy This Template (Recommended)

**Choose HTML Format**, then paste:

```html
<div style="font-family: Oxanium, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #4a3517; max-width: 600px; margin: 0 auto; background-color: #ffffff;">

  <!-- Header with Illustration -->
  <div style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); padding: 40px 20px 30px; text-align: center;">
    <!-- SVG Illustration -->
    <div style="margin-bottom: 20px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 894.24907 448.2822" style="display: inline-block;">
        <path d="M447.36954,674.1411q-40.47485,0-80.82885-1.44922c-38.44043-1.38086-78.18993-2.80762-115.13556-23.29883-25.84506-14.333-48.73487-37.3291-66.19418-66.50391a223.77042,223.77042,0,0,1-25.36927-63.60449,261.47594,261.47594,0,0,1,.95286-123.77929,219.83406,219.83406,0,0,1,14.7411-40.40039c26.94295-55.79346,76.08491-93.2461,134.82585-102.75391a6.80653,6.80653,0,0,1,1.463-.03125c.26419.01416.52753.0293.796.01807l.3456-.10987a16.88152,16.88152,0,0,1,2.72076-.69824c90.59405-13.48682,186.365,13.80176,276.95228,78.91357,70.04208,50.35108,162.86753,77.46436,283.78131,82.88916l1.71659.08985c33.6596,1.93359,66.21835,15.81054,94.16038,40.13281,27.57946,24.00586,48.28706,56.03418,59.88378,92.624,1.42568,4.46094,2.73262,9.1045,3.88437,13.80079a26.0388,26.0388,0,0,1-6.941,24.69042v.00879l-.30109.30957c-.72471.72071-1.48759,1.41211-2.26743,2.05567l-.91682.75586c-7.72718,6.36523-13.83023,11.39355-21.13462,15.29883a64.98321,64.98321,0,0,1-15.41875,5.82128c-29.46525,7.1836-59.38763,13.84375-88.936,19.79688-57.3848,11.57031-116.28137,21.11523-175.05411,28.36816A2269.14089,2269.14089,0,0,1,447.36954,674.1411Zm-136.232-419.84522a3.50685,3.50685,0,0,0-.5394.03662c-58.19178,9.41895-106.86855,46.50391-133.54434,101.74512a217.62434,217.62434,0,0,0-14.59523,40,259.18846,259.18846,0,0,0-.941,122.68067,221.62191,221.62191,0,0,0,25.12332,62.99609c17.28842,28.88867,39.94414,51.6543,65.51823,65.83594,36.614,20.30761,76.17609,21.72851,114.43587,23.10156a2266.31375,2266.31375,0,0,0,358.31544-15.59473c58.73458-7.249,117.593-16.78711,174.94-28.35058,29.52843-5.94825,59.43-12.60352,88.87535-19.78321a63.35819,63.35819,0,0,0,15.04728-5.67871c7.15725-3.82617,13.20219-8.80664,20.85517-15.11133l.91681-.75488c.67044-.55371,1.32858-1.14551,1.9583-1.76074l.18065-.18945c6.2892-6.33887,8.73475-14.70215,6.70987-22.94434v-.001c-1.13944-4.64648-2.4324-9.24023-3.84366-13.65527-23.69-74.74609-84.97359-127.56934-152.49635-131.44727l-1.70726-.08984c-55.23185-2.47851-103.56386-9.34375-147.75156-20.99023-52.74984-13.90235-98.80127-34.83008-136.87574-62.20069-90.24209-64.8623-185.61273-92.04931-275.81114-78.62646a15.47307,15.47307,0,0,0-2.47862.64258l-.62294.17431a9.37442,9.37442,0,0,1-1.06184-.01269C311.53655,254.30663,311.3347,254.29588,311.13751,254.29588Z" transform="translate(-152.87546 -225.8589)" fill="rgba(255,255,255,0.15)"/>
        <path d="M432.2022,371.9146c-2.498-2.39659-5.05306-15.76155-8.24216-17.11834,2.38389,5.2686.65305,6.66348.64035,12.44567a39.12306,39.12306,0,0,1-1.14125,9.74477H369.435V334.82486a28.84672,28.84672,0,0,1,28.84757-28.84758,17.21385,17.21385,0,0,1,4.27584.626A27.42847,27.42847,0,0,1,421.909,326.0071C426.02756,341.06071,432.57759,366.11854,432.2022,371.9146Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M372.605,423.78163l.02663-32.86268L353.314,392.64521l6.81759,20.7264-3.19073,52.09644a8.17282,8.17282,0,1,0,9.88987,6.88859Z" transform="translate(-152.87546 -225.8589)" fill="#fef8f3"/>
        <polygon points="257.746 432.76 265.55 432.759 269.263 402.657 257.744 402.657 257.746 432.76" fill="#fef8f3"/>
        <path d="M407.97822,654.76874l12.33707-.73635v5.28573l11.7292,8.10061a3.30167,3.30167,0,0,1-1.87612,6.01864H415.48062L412.949,668.209l-.98849,5.2284h-5.53786Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <polygon points="212.62 432.76 220.425 432.759 224.137 402.657 212.619 402.657 212.62 432.76" fill="#fef8f3"/>
        <path d="M362.85281,654.76874l12.33707-.73635v5.28573l11.72919,8.10061a3.30167,3.30167,0,0,1-1.87612,6.01864H370.35521l-2.53166-5.2284-.98848,5.2284H361.2972Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M403.67163,355.43027l-16.16732.317-11.41223,12.04624-9.14932,1.3419a18.2656,18.2656,0,0,0-15.57717,16.89718v0l1.585,8.70644h9.51019l5.50164,32.30284c-2.13925,5.4511-2.28468,9.75391,2.10651,11.444l13.63127,25.67751L423.96,446.09408c2.04173-3.51013,2.696-7.03574.609-10.46423l2.87806-49.45h9.67743v0c0-9.24869-3.12837-17.04569-12.31963-18.07484a108.65383,108.65383,0,0,0-10.98908-.62852Z" transform="translate(-152.87546 -225.8589)" fill="rgba(255,255,255,0.9)"/>
        <path d="M423.96,446.09408s-39.30879,6.97414-53.89108-7.60815c0,0-1.48046,2.51333-3.71127,6.68153-.64153,1.19868-1.88058,2.0107-2.62886,3.46267-.68006,1.31961-2.4292,2.94192-3.17006,4.43857-.596,1.204.36014,2.77744-.26,4.07817-7.46789,15.66368-16.19278,37.75861-14.32228,52.34848,1.20624,9.40867,3.69764,31.30177,6.32152,54.81615.205,1.83719-1.45549,4.19725-1.24942,6.04906.19432,1.74621,2.25519,2.98365,2.44951,4.73391.129,1.16211-1.31017,2.34755-1.18148,3.50826.14118,1.27343,1.8502,2.52186,1.99063,3.79039,3.59444,32.46814,6.88554,62.78094,6.88554,62.78094h18.38637l3.46913-69.2317-2.83512-25.23619,6.65714-51.038,9.19318,48.502,1.18261,27.29716,9.71542,70.9748H423.96v-68.708l1.268-3.56944-1.268-4.57787,1.268-4.93232-1.268-5.37164Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M408.634,346.05478a18.326,18.326,0,1,1,3.17509-15.31446c.05272.21964.09718.43807.14038.66481A18.301,18.301,0,0,1,408.634,346.05478Z" transform="translate(-152.87546 -225.8589)" fill="#fef8f3"/>
        <path d="M404.81288,335.59833a9.633,9.633,0,0,0-2.815-5.10383,13.1421,13.1421,0,0,1-.76086,5.50961,25.3951,25.3951,0,0,1-13.95455-2.76428c-3.23345-2.19366-7.34819-2.00351-12.14136,0a17.75012,17.75012,0,0,1,17.75236-17.75236h3.17006a17.75559,17.75559,0,0,1,17.75235,17.75236A52.85225,52.85225,0,0,1,404.81288,335.59833Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <circle cx="113.24907" cy="285" r="51" fill="rgba(255,255,255,0.15)"/>
        <circle cx="438.24907" cy="51" r="51" fill="rgba(255,255,255,0.15)"/>
        <circle cx="843.24907" cy="293" r="51" fill="rgba(255,255,255,0.15)"/>
        <path d="M683.12454,282.42068V398.06673A9.11863,9.11863,0,0,1,674.101,407.186a.80182.80182,0,0,1-.09986.00416H660.54129a40.6065,40.6065,0,0,1-40.6065-40.6065v-84.163a9.12338,9.12338,0,0,1,9.12338-9.12338l5.454,0c-2.52672,7.37064,31.7654,10.47377,33.648,0l5.841,0A9.12341,9.12341,0,0,1,683.12454,282.42068Z" transform="translate(-152.87546 -225.8589)" fill="#ffffff"/>
        <path d="M643.18162,264.64967a1.19706,1.19706,0,0,1,1.19565-1.19566h8.13043a1.19566,1.19566,0,0,1,0,2.39131h-8.13043A1.19706,1.19706,0,0,1,643.18162,264.64967Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M676.79446,421.8589h-51.416a15.06329,15.06329,0,0,1-15.04639-15.0459V325.9717a2.18651,2.18651,0,0,1-.91113-1.77881v-8.13037a2.18557,2.18557,0,0,1,.91113-1.77832v-2.18213a2.1856,2.1856,0,0,1-.91113-1.77832v-8.13086a2.18557,2.18557,0,0,1,.91113-1.77832v-3.94385a2.18353,2.18353,0,0,1-1.15039-1.92969v-8.13037a2.1843,2.1843,0,0,1,1.15039-1.93018V273.67384A15.06329,15.06329,0,0,1,625.37844,258.628h51.416a15.06288,15.06288,0,0,1,15.0459,15.04589V297.23a1.8859,1.8859,0,0,1,.88574,1.59814v15.50293a1.88674,1.88674,0,0,1-.88574,1.59863V406.813A15.06288,15.06288,0,0,1,676.79446,421.8589ZM625.37844,260.628a13.061,13.061,0,0,0-13.04639,13.04589v12.50782l-.96191.03711a.19547.19547,0,0,0-.18848.19189V294.541a.19617.19617,0,0,0,.18848.1919l.96191.03662v7.04931l-.76074.1875a.19651.19651,0,0,0-.15039.18653v8.13086a.19651.19651,0,0,0,.15039.18652l.76074.1875v4.99072l-.76074.1875a.19651.19651,0,0,0-.15039.18653v8.13037a.19664.19664,0,0,0,.15039.187l.76074.1875V406.813a13.061,13.061,0,0,0,13.04639,13.0459h51.416a13.0609,13.0609,0,0,0,13.0459-13.0459V314.2173h.88574V298.9424h-.88574V273.67384a13.06089,13.06089,0,0,0-13.0459-13.04589Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <circle cx="504.1757" cy="38.79076" r="1.19565" fill="#2f2e41"/>
        <path d="M396.95559,496.26173H263.16848a7.18838,7.18838,0,0,1-7.16992-7.16894v-65.189a7.1884,7.1884,0,0,1,7.16894-7.16992H396.95461a7.18841,7.18841,0,0,1,7.16993,7.16895v65.189A7.1884,7.1884,0,0,1,396.95559,496.26173Z" transform="translate(-152.87546 -225.8589)" fill="#ffffff"/>
        <path d="M396.95559,496.26173H263.16848a7.18838,7.18838,0,0,1-7.16992-7.16894v-65.189a7.1884,7.1884,0,0,1,7.16894-7.16992H396.95461a7.18841,7.18841,0,0,1,7.16993,7.16895v65.189A7.1884,7.1884,0,0,1,396.95559,496.26173ZM263.16848,418.7339a5.18526,5.18526,0,0,0-5.16992,5.1709v65.187a5.18494,5.18494,0,0,0,5.1709,5.16992H396.95364a5.18515,5.18515,0,0,0,5.1709-5.17089v-65.187a5.18527,5.18527,0,0,0-5.1709-5.16992Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M337.23235,486.62784c-26.38574,0-53.89882-.25214-64.16427-.41561a5.17627,5.17627,0,0,1-5.06954-5.15521V427.09538a1.82954,1.82954,0,0,1,1.823-1.82756H390.29728a1.82942,1.82942,0,0,1,1.82726,1.8227v36.612a22.84157,22.84157,0,0,1-22.45691,22.75218C360.10027,486.57927,348.7713,486.62784,337.23235,486.62784Z" transform="translate(-152.87546 -225.8589)" fill="#d97706"/>
        <path d="M383.146,460.33888H274.28664a4.43849,4.43849,0,0,1-4.16406-2.93554l-12.32129-34.56641a4.4228,4.4228,0,0,1,4.15772-5.90674l136.07226-.18945a4.42312,4.42312,0,0,1,4.35938,5.19775l.105.04444-.39063.91162-.0039.00927-14.895,34.75538A4.40962,4.40962,0,0,1,383.146,460.33888Zm14.8916-41.59814-136.07471.18945a2.42256,2.42256,0,0,0-2.27783,3.23535l12.3208,34.56494a2.43347,2.43347,0,0,0,2.28223,1.6084H383.146a2.4131,2.4131,0,0,0,2.22168-1.46679l14.89551-34.75635.73242.314-.73242-.314a2.42117,2.42117,0,0,0-2.22559-3.375Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <circle cx="176.98309" cy="233.4802" r="8.52402" fill="#ffffff"/>
        <circle cx="498.98309" cy="159.4802" r="8.52402" fill="#ffffff"/>
        <path d="M974.25454,508.9789l-22.77-22.48a11.884,11.884,0,0,0-8.43-3.46h-.08a11.9143,11.9143,0,0,0-8.46,3.56,27.99135,27.99135,0,0,0-.49,38.84c.24.26.49.51.74.76a27.248,27.248,0,0,0,4.56,3.65,27.67639,27.67639,0,0,0,15.11,4.43h.17a27.82649,27.82649,0,0,0,19.75-8.32,12.023,12.023,0,0,0-.1-16.98Zm-1.32,15.57a26.09171,26.09171,0,0,1-32.76,3.48,26.78641,26.78641,0,0,1-4.01-3.25,26.00168,26.00168,0,0,1-.23-36.77,9.91308,9.91308,0,0,1,7.06-2.97h.06a9.911,9.911,0,0,1,7.02,2.88l22.77,22.49a10.00707,10.00707,0,0,1,.09,14.14Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M899.54452,435.19887l-22.77-22.49a11.92636,11.92636,0,0,0-8.43-3.46h-.07a11.947,11.947,0,0,0-8.47,3.56994,28.07691,28.07691,0,0,0-4.72,33l.01.01a27.562,27.562,0,0,0,4.33,5.93c.19.22.41.44.63.66a27.83532,27.83532,0,0,0,19.67,8.08h.18a27.854,27.854,0,0,0,19.75-8.33,11.99892,11.99892,0,0,0-.11-16.97Zm-1.32,15.57a25.85541,25.85541,0,0,1-18.33,7.73h-.17a26.00049,26.00049,0,0,1-18.49-44.27,10.00761,10.00761,0,0,1,14.14-.09l22.77,22.48A10.01911,10.01911,0,0,1,898.22451,450.76888Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <path d="M975.70994,516.04649l-25.1032-24.79357a8.72678,8.72678,0,0,0-12.32743.0765,22,22,0,1,0,31.30516,30.919Z" transform="translate(-152.87546 -225.8589)" fill="#d97706"/>
        <path d="M901.00443,442.26243l-25.1032-24.79356a8.72676,8.72676,0,0,0-12.32743.0765,22,22,0,1,0,31.30516,30.919Z" transform="translate(-152.87546 -225.8589)" fill="#d97706"/>
        <path d="M948.12454,531.48891l-.6,1.57995q-4.23-1.60491-8.2-3.22c-46.88-19.13-69.26-41.52-84.23-84.02l-.01-.01q-1.065-3-2.07-6.13995l1.58-.51a25.54187,25.54187,0,0,0,2.3,5.78q1.23,3.495,2.53,6.81c14.07,35.87,34.82,56.37,74.6,73.68q3,1.30507,6.15,2.59A26.08663,26.08663,0,0,0,948.12454,531.48891Z" transform="translate(-152.87546 -225.8589)" fill="#2f2e41"/>
        <rect x="900.62305" y="448.539" width="2.00052" height="73.00017" transform="translate(-229.92517 559.82386) rotate(-45.35527)" fill="#2f2e41"/>
        <path d="M436.64029,416.17348l.02662-32.86269-19.31762,1.72627,6.81759,20.7264-24.74716,37.51415a8.17278,8.17278,0,1,0,9.88987,6.88859Z" transform="translate(-152.87546 -225.8589)" fill="#fef8f3"/>
      </svg>
    </div>

    <div style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      New Contact Form Submission
    </div>
    <div style="color: rgba(255, 255, 255, 0.95); font-size: 13px; margin-top: 8px; font-weight: 500;">
      Portfolio Contact — {{from_name}}
    </div>
  </div>

  <!-- Content Container -->
  <div style="padding: 35px 30px; background-color: #fef8f3;">

    <!-- Inquiry Type Badge -->
    <div style="margin-bottom: 25px; text-align: center;">
      <span style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
        {{subject}}
      </span>
    </div>

    <table role="presentation" style="width: 100%; border-collapse: collapse;">

      <!-- Contact Information Section -->
      <tr>
        <td colspan="2" style="padding-bottom: 25px; border-bottom: 2px solid #f3e8dc;">
          <div style="font-size: 11px; font-weight: 600; color: #92776a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
            📋 Contact Information
          </div>
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Name</div>
                <div style="font-size: 16px; font-weight: 600; color: #4a3517;">{{from_name}}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Email</div>
                <div style="font-size: 15px; color: #d97706;">
                  <a href="mailto:{{from_email}}" style="color: #d97706; text-decoration: none;">{{from_email}}</a>
                </div>
              </td>
            </tr>
            <!-- Company (if provided) -->
            {{#company}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Company</div>
                <div style="font-size: 15px; color: #4a3517; font-weight: 500;">{{company}}</div>
              </td>
            </tr>
            {{/company}}
            <!-- Role (if provided) -->
            {{#role}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Role</div>
                <div style="font-size: 15px; color: #4a3517;">{{role}}</div>
              </td>
            </tr>
            {{/role}}
          </table>
        </td>
      </tr>

      <!-- Project Details Section (if provided) -->
      {{#budgetRange}}
      <tr>
        <td colspan="2" style="padding-top: 25px; padding-bottom: 25px; border-bottom: 2px solid #f3e8dc;">
          <div style="font-size: 11px; font-weight: 600; color: #92776a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
            💼 Project Details
          </div>
          <table role="presentation" style="width: 100%;">
            {{#budgetRange}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Budget Range</div>
                <div style="font-size: 15px; color: #4a3517; font-weight: 500;">{{budgetRange}}</div>
              </td>
            </tr>
            {{/budgetRange}}
            {{#timeline}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Timeline</div>
                <div style="font-size: 15px; color: #4a3517;">{{timeline}}</div>
              </td>
            </tr>
            {{/timeline}}
            {{#projectType}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Project Type</div>
                <div style="font-size: 15px; color: #4a3517;">{{projectType}}</div>
              </td>
            </tr>
            {{/projectType}}
          </table>
        </td>
      </tr>
      {{/budgetRange}}

      <!-- Additional Contact Info (if provided) -->
      {{#phone}}
      <tr>
        <td colspan="2" style="padding-top: 25px; padding-bottom: 25px; border-bottom: 2px solid #f3e8dc;">
          <div style="font-size: 11px; font-weight: 600; color: #92776a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
            📞 Additional Contact
          </div>
          <table role="presentation" style="width: 100%;">
            {{#phone}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Phone</div>
                <div style="font-size: 15px; color: #4a3517;">
                  <a href="tel:{{phone}}" style="color: #4a3517; text-decoration: none;">{{phone}}</a>
                </div>
              </td>
            </tr>
            {{/phone}}
            {{#linkedin}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">LinkedIn</div>
                <div style="font-size: 14px; color: #d97706;">
                  <a href="{{linkedin}}" style="color: #d97706; text-decoration: none;">View Profile</a>
                </div>
              </td>
            </tr>
            {{/linkedin}}
            {{#preferredContact}}
            <tr>
              <td style="padding: 8px 0;">
                <div style="font-size: 13px; color: #92776a; margin-bottom: 4px;">Preferred Contact Method</div>
                <div style="font-size: 15px; color: #4a3517;">{{preferredContact}}</div>
              </td>
            </tr>
            {{/preferredContact}}
          </table>
        </td>
      </tr>
      {{/phone}}

      <!-- Message -->
      <tr>
        <td colspan="2" style="padding-top: 25px; padding-bottom: 30px;">
          <div style="font-size: 11px; font-weight: 600; color: #92776a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
            💬 Message
          </div>
          <div style="font-size: 15px; color: #4a3517; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; background-color: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #d97706; box-shadow: 0px 2px 3px 0px rgba(72, 54, 39, 0.09);">
{{message}}
          </div>
        </td>
      </tr>

    </table>

    <!-- Reply Button -->
    <div style="text-align: center; margin-top: 15px;">
      <a href="mailto:{{from_email}}?subject=Re: {{subject}}"
         style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0px 2px 3px 0px rgba(72, 54, 39, 0.18), 0px 4px 6px -1px rgba(72, 54, 39, 0.18);">
        Reply to Message
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #f9f5f1; padding: 25px 30px; border-top: 1px solid #e7dac8;">
    <div style="text-align: center; color: #6b5b4e; font-size: 13px; line-height: 1.6;">
      <div style="margin-bottom: 8px;">
        This message was sent via your portfolio contact form
      </div>
      <div style="font-size: 12px; color: #92776a;">
        Powered by EmailJS • Secure & Reliable
      </div>
    </div>
  </div>
</div>
```

### 4. Test It

Click **"Test It"** button and enter test data with all new fields:

**Basic Test (Job Inquiry):**
```json
{
  "from_name": "John Smith",
  "from_email": "john@example.com",
  "subject": "Job Opportunity",
  "message": "I'd like to discuss a senior developer position at our company.",
  "company": "Tech Corp",
  "role": "Senior Recruiter"
}
```

**Full Test (Freelance Project):**
```json
{
  "from_name": "Sarah Johnson",
  "from_email": "sarah@startup.com",
  "subject": "Freelance Project",
  "message": "We need a full-stack developer for our e-commerce platform.",
  "company": "Startup Inc",
  "role": "CTO",
  "budgetRange": "$10,000 - $25,000",
  "timeline": "3-6 Months",
  "projectType": "Web Application",
  "phone": "+1-555-0123",
  "linkedin": "https://linkedin.com/in/sarahjohnson",
  "preferredContact": "Email"
}
```

Check your inbox to see how optional fields display conditionally!

### 5. Save & Copy Template ID

- Click **"Save"**
- Copy the **Template ID** (something like `template_abc123`)

### 6. Update .env.local

```env
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_abc123
```

### 7. Restart Dev Server

```bash
bun run dev
```

## ✅ Done!

Test your contact form at http://localhost:3000/#contact

---

## 📚 Need More Options?

See **EMAILJS_TEMPLATE_GUIDE.md** for:
- 3 different template designs
- Best practices
- Mobile optimization
- Auto-reply setup
- Advanced customization

## 🆘 Troubleshooting

**Template variables not showing?**
- Make sure variable names match exactly: `{{from_name}}`, `{{from_email}}`, etc.
- Check template is saved
- Template ID is correct in .env.local

**Emails not arriving?**
- Check spam folder
- Verify email service is connected in EmailJS dashboard
- Test template using "Test It" button

**Formatting issues?**
- Use HTML format (not plain text)
- Make sure to paste the entire HTML including `<html>` tags
- Test in different email clients

---

## 🎨 Free Illustrations for Email Templates

The template above includes a professional illustration from **unDraw**. Here are more free resources you can use:

### 🌟 Recommended: unDraw (Used in Template)

**Website:** https://undraw.co/

**Features:**
- ✅ Free for commercial use
- ✅ No attribution required
- ✅ Customizable colors
- ✅ SVG and PNG formats
- ✅ API access for dynamic colors

**How to Use:**

1. **Via API (Current Template):**
   ```html
   <img src="https://undraw.co/api/illustration/contact-us?color=ffffff" />
   ```
   Replace `ffffff` with your hex color (without #)

2. **Download Custom SVG:**
   - Visit: https://undraw.co/illustrations
   - Search for: "contact us", "email", "messaging"
   - Customize color to: `#d97706` (your theme orange)
   - Download SVG or PNG
   - Host on your server or use base64 encoding

**Other Great Contact Illustrations from unDraw:**
- **Contact us:** `https://undraw.co/illustration/contact-us`
- **Email capture:** `https://undraw.co/illustration/email-capture`
- **Personal email:** `https://undraw.co/illustration/personal-email`
- **Email campaign:** `https://undraw.co/illustration/email-campaign`
- **Messages:** `https://undraw.co/illustration/messages`

### 🎯 Alternative Free Illustration Resources

**1. Lukasz Adam Illustrations**
- Website: https://lukaszadam.com/illustrations
- License: CC0 (completely free, no attribution)
- Style: Minimalist, professional

**2. DrawKit**
- Website: https://www.drawkit.com/
- Free tier with commercial use
- Style: Modern, colorful illustrations

**3. OpenDoodles**
- Website: https://www.opendoodles.com/
- Free for personal and commercial use
- Style: Hand-drawn, friendly

**4. Storyset by Freepik**
- Website: https://storyset.com/
- Free with attribution (or paid for no attribution)
- Style: Animated SVGs, highly customizable

**5. Illustrations.co**
- Website: https://illlustrations.co/
- 100+ free illustrations
- Style: Colorful, modern

### 📧 Email-Safe Image Best Practices

**Option 1: Use API (Recommended for unDraw)**
```html
<img src="https://undraw.co/api/illustration/contact-us?color=d97706"
     alt="Contact"
     style="max-width: 200px; height: auto;" />
```

**Option 2: Self-Host**
1. Download SVG from unDraw
2. Upload to your website's `/public/images/` folder
3. Use absolute URL:
```html
<img src="https://yourdomain.com/images/contact-illustration.svg"
     alt="Contact"
     style="max-width: 200px; height: auto;" />
```

**Option 3: Base64 Encoding (Small images only)**
1. Convert SVG to base64
2. Embed directly (increases email size):
```html
<img src="data:image/svg+xml;base64,..." alt="Contact" />
```

### 🎨 Customizing Colors for Your Theme

**Your Portfolio Theme Colors:**
- Primary Orange: `#d97706`
- Secondary Orange: `#ea580c`
- White for contrast: `#ffffff`

**unDraw API Color Usage:**
```html
<!-- Orange illustration on gradient background -->
<img src="https://undraw.co/api/illustration/contact-us?color=ffffff" />

<!-- Or download and customize to exact #d97706 -->
```

### ⚠️ Email Client Compatibility

**Safe for all email clients:**
- ✅ PNG format (best compatibility)
- ✅ JPEG format
- ⚠️ SVG (limited support - Gmail blocks SVG)
- ⚠️ GIF (works but some security filters flag it)

**Recommendation:** Use PNG for maximum compatibility across all email clients (Gmail, Outlook, Apple Mail, etc.)
