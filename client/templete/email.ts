export const getBadgeEmailTemplete = (
  badgeImageUrl: string,
  translationMessage: { [key: string]: string },
  currentQuestionIndex: number
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
      @import url(https://assets-stage.samsungplus.net/certification/s25/fonts/sharpSans/SamsungSharpSans-Regular.woff);

      .colored-black {
        color:#ffffff;
        mix-blend-mode:difference;
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
        background-image: url(https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.jpg);
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
                    font-size: 38px;
                    line-height: 42px;
                    letter-spacing: -1px;
                    margin: 0;
                    padding: 0;
                  "
                >
                  
                  S+ ${translationMessage["galaxy_ai_expert"]}
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
                    margin: 70px auto;
                    text-align: center;
                    background-image: url(${badgeImageUrl});
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 148px;
                    height: 148px;
                  "
                ></div>
                <h3 class="colored-black" style="text-align: center">
                  S+ ${translationMessage["galaxy_ai_expert"]}
                </h3>
                <h5 class="colored-black" style="text-align: center">
                ${translationMessage["email_badge_date"]}
                </h5>
              </div>

              <div
                class="interface"
                style="font-weight: 400; margin-bottom: 30px"
              >
                <p
                  class="colored-black"
                  style="
                    font-weight: normal;
                    font-family: 'SamsungSharpSans', sans-serif;
                    font-size: 14px;
                    white-space: pre-wrap;
                    border-radius: 4px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    padding-bottom:5px;
                  "
                >
                  ${translationMessage["email_badge_description_1"]}
                </p>
                <p
                  class="colored-black"
                  style="
                  font-weight: normal;
                  font-family: 'SamsungSharpSans', sans-serif;
                  font-size: 14px;
                  white-space: pre-wrap;
                  color:black
                  border-radius: 4px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                "
                >
                  ${
                    currentQuestionIndex === 2
                      ? translationMessage["email_badge_description_2"]
                      : translationMessage["email_badge_description_3"]
                  }
                </p>
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
${translationMessage["email_badge_description_4"]}</pre
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
Copyright ⓒ 2024 SAMSUNG all rights reserved.</pre
                >
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
    <!-- <div class="email-container">
      <div class="header">S+ Galaxy AI Expert(Paradigm)</div>
      <img
        src="https://assets-stage.samsungplus.net/certification/s25/images/badge/badge_stage4.png"
        alt="Galaxy AI Expert Badge"
        class="badge-image"
      />
      <div class="congratulations">
        Congratulations!<br />
        You have earned the Galaxy AI Expert Badge.
      </div>
    </div>
    <div class="footer">
      This message was automatically delivered by Samsung+ service. Do not reply
      to this message.<br />
      Copyright © 2024 SAMSUNG all rights reserved.
    </div> -->
  </body>
</html>
`;
};
