export const getLoginEmailTemplete = (
  galaxyAIExpert: string,
  emailVerifyCodeDescription1: string,
  emailVerifyCodeDescription2: string,
  emailBadgeDescription4: string,
) => {
  return `
<!DOCTYPE html>
<html style="font-weight: 400">
  <head style="font-weight: 400">
    <meta charset="utf-8" style="font-weight: 400" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      style="font-weight: 400"
    />

    <style type="text/css" style="font-weight: 400">
      @import url(https://assets.samsungplus.net/certification/common/fonts/sharpSans/SamsungSharpSans-Regular.woff);

      .colored-black {
        color: #ffffff;
        mix-blend-mode: difference;
      }
    </style>
  </head>
  <body
    style="
      font-weight: 400;
      width: 100%;
      font-size: 16px;
      font-family: 'SamsungSharpSans', sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0;
      padding: 0;
      background-color: #000000;
      box-sizing: border-box;
    "
  >
    <table
      style="
        font-weight: 400;
        width: 100%;
        border-collapse: separate;
        font-size: 16px;
        font-family: 'SamsungSharpSans' sans-serif;
        background-image: url(https://assets.samsungplus.net/certification/common/images/bg_pattern_01.jpg);
        -webkit-font-smoothing: antialiased;
        max-width: 800px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        border: 1px solid #c7d0d4;
        border-spacing: 0;
        margin: 15px auto;
        padding: 0;
      "
    >
      <tr style="font-weight: 400">
        <td style="font-weight: 400; text-align: center; margin: 0; padding: 0;">
          <div style="font-weight: 400; font-size: 14px; padding: 23px 0">
            <div
              style="
                font-weight: 400;
                max-width: 600px;
                text-align: left;
                margin: 0 auto;
                padding: 0 20px;
              "
            >
              <div
                style="
                  font-weight: 600;
                  display: inline-block;
                  width: 100%;
                  align-items: center;
                "
              >
                <h1
                  class="colored-black"
                  style="
                    font-weight: 700;
                    float: left;
                    font-size: 16px;
                    line-height: 42px;
                    letter-spacing: -1px;
                    margin: 0;
                    padding: 0;
                  "
                >S+ ${galaxyAIExpert}</h1>
              </div>
            </div>
          </div>
        </td>
      </tr>
      <tr style="font-weight: 400">
        <td style="font-weight: 400; text-align: center; margin: 0; padding: 0;">
          <div
            style="
              font-weight: 400;
              max-width: 600px;
              text-align: left;
              margin: 0 auto;
              padding: 0 20px;
            "
          >
            <div style="font-weight: 400; padding: 30px 0 20px">
              <h2
                class="colored-black"
                style="
                  font-weight: 700;
                  font-size: 54px;
                  margin: 70px 0;
                  text-align: center;
                "
              >
                $CODE$
              </h2>

              <div
                style="font-weight: 400; margin-bottom: 30px; "
              >
                <h3
                  class="title"
                  style="
                    font-weight: 700;
                    font-size: 18px;
                    margin: 0 0 15px;
                  "
                ></h3>
                <p
                  class="colored-black"
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans' sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    padding-bottom:5px;
                  "
                >${emailVerifyCodeDescription1}</p>
                <p
                  class="colored-black"
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans' sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                  "
                >${emailVerifyCodeDescription2}</p>
              </div>
            </div>
          </div>
        </td>
      </tr>
      <tr style="font-weight: 400">
        <td
          style="
            font-weight: 400;
            text-align: center;
            margin: 0;
            padding: 0;
            background-color: #121212;
            color: #ffffff;
          "
        >
          <div style="font-weight: 400; font-size: 14px; padding: 23px 0">
            <div
              style="
                font-weight: 400;
                max-width: 600px;
                text-align: left;
                margin: 0 auto;
                padding: 0 20px;
              "
            >
              <div
                style="
                  font-weight: 400;
                  display: inline-block;
                  width: 100%;
                  align-items: center;
                "
              >
                <p
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans' sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    margin: 0 0 15px;
                  "
                >${emailBadgeDescription4}</p>
                <p
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans' sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    margin: 0 0 15px;
                  "
                >Copyright ⓒ 2024 SAMSUNG all rights reserved.</p>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const getBadgeEmailTemplete = (
  badgeImageUrl: string,
  galaxyAIExpert: string,
  emailBadgeDate: string,
  emailBadgeDescriptionA: string,
  emailBadgeDescriptionB: string,
  emailBadgeDescriptionC: string,
) => {
  return `<!DOCTYPE html>
<html style="font-weight: 400">
  <head style="font-weight: 400">
    <meta charset="utf-8" style="font-weight: 400" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      style="font-weight: 400"
    />

    <style type="text/css" style="font-weight: 400">
      @import url(https://assets.samsungplus.net/certification/common/fonts/sharpSans/SamsungSharpSans-Regular.woff);

      .colored-black {
        color: #ffffff;
        mix-blend-mode: difference;
      }
    </style>
  </head>
  <body
    style="
      font-weight: 400;
      width: 100%;
      font-size: 16px;
      font-family: 'SamsungSharpSans', sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0;
      padding: 0;
      background-color: #000000 !important;
    "
  >
    <table
      class="main"
      style="
        font-weight: 400;
        width: 100%;
        border-collapse: separate;
        font-size: 16px;
        font-family: 'SamsungSharpSans', sans-serif;
        background-image: url(https://assets.samsungplus.net/certification/common/images/bg_pattern_01.jpg);
        -webkit-font-smoothing: antialiased;
        max-width: 800px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        border: 1px solid #c7d0d4;
        border-spacing: 0;
        margin: 15px auto;
        padding: 0;
      "
    >
      <tr style="font-weight: 400">
        <td style="font-weight: 400; text-align: center; margin: 0; padding: 0">
          <div style="font-weight: 400; font-size: 14px; padding: 23px 0">
            <div
              style="
                font-weight: 400;
                max-width: 600px;
                text-align: left;
                margin: 0 auto;
                padding: 0 20px;
              "
            >
              <div
                style="
                  font-weight: 600;
                  display: inline-block;
                  width: 100%;
                  align-items: center;
                "
              >
                <h1
                  class="colored-black"
                  style="
                    font-weight: 700;
                    float: left;
                    font-size: 24px;
                    line-height: 42px;
                    letter-spacing: -1px;
                    margin: 0;
                    padding: 0;
                  "
                >
                  S+ ${galaxyAIExpert}
                </h1>
              </div>
            </div>
          </div>
        </td>
      </tr>
      <tr style="font-weight: 400">
        <td style="font-weight: 400; text-align: center; margin: 0; padding: 0">
          <div
            class="container"
            style="
              font-weight: 400;
              max-width: 600px;
              text-align: left;
              margin: 0 auto;
              padding: 0 20px;
            "
          >
            <div class="inner" style="font-weight: 400; padding: 30px 0 20px">
              <div style="width: 100%">
                <div
                  style="
                    margin: 70px auto 17px;
                    text-align: center;
                    background-image: url(${badgeImageUrl});
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 180px;
                    height: 180px;
                  "
                ></div>
                <h3 class="colored-black" style="text-align: center; margin:0;">
                  S+ ${galaxyAIExpert}
                </h3>
                <h3 class="colored-black" style="text-align: center; margin:0; font-weight: 400;">
                  ${emailBadgeDate}
                </h3>
              </div>

             <h1
                  class="colored-black"
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans', sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    padding-bottom: 5px;
                  "
                >
                  ${emailBadgeDescriptionA}
                </h1>
                <h1
                  class="colored-black"
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans', sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    color: black;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                  "
                >
                  ${emailBadgeDescriptionB}
                </h1>
            </div>
          </div>
        </td>
      </tr>
      <tr style="font-weight: 400">
        <td
          style="
            font-weight: 400;
            text-align: center;
            margin: 0;
            padding: 0;
            background-color: #121212 !important;
            color: #ffffff !important;
          "
        >
          <div style="font-weight: 400; font-size: 14px; padding: 23px 0">
            <div
              style="
                font-weight: 400;
                max-width: 600px;
                text-align: left;
                margin: 0 auto;
                padding: 0 20px;
              "
            >
              <div
                class="header-with-buttons"
                style="
                  font-weight: 400;
                  display: inline-block;
                  width: 100%;
                  align-items: center;
                "
              >
                <pre
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans', sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    margin: 0 0 15px;
                  "
                >
${emailBadgeDescriptionC}</pre>
                <pre
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans', sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    margin: 0 0 15px;
                  "
                >
Copyright ⓒ 2024 SAMSUNG all rights reserved.</pre>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
