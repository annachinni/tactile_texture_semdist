/* 
Assignment inference task: 2 bars for color as perceptual cue

Brief description of task: Experimenters see one concept word displayed at the top of the screen and two bars in the plot below. 
They use the display to set up the tactile experiment trials, and ask the participant to make a judgement about which texture bar represents the target concept for a given trial.
The experimenter then records the participant's judgement with the corresponding keyboard response.

***IMPORTANT: In the experiment, the experimenter's left is the participant's right and the experimenter's right is the participant's left, but we already acount for this in this plugin.
The left and right assigned textures are reversed in the display for the experimenter so that they set up the trays to align with the participant's orientation, and enter the response the participant makes without needing to reverse responses.
Experimenters should set the trays up with the tray grabtab closest to them them (the bar graph axes are at the top/bar graph is upside down for the experimenter). 

***DO NOT reverse left and right in the experiment script as it is already done in this plugin. Experimenters should enter the exact responses the participant makes.***


Parameters:
- prompt  = concept to be assigned
- left_height = height of left bar - these are the peg values on the tactile bar graph (1-8 possible pegs)
- right_height = height of right bar - these are the peg values on the tactile bar graph (1-8 possible pegs)
- left_texture = texture id for left bar
- right_texture = texture id for right bar
- bg_color = background color (this should be the same as the document background color)
- response_ends_trial = if true, trial ends when response is made
- correct_side = "left" or "right", for accuracy coding
- trial_duration = maximum duration of trial in ms (optional)


Data:
- rt = reaction time
- key = key pressed
- chosen_side = "left" or "right"
- correct_side = as above
- accuracy = 1 if correct, 0 if incorrect, null if correct_side is null or no response
- final_left = final height of left bar (with jitter - this is the same as left_height and right_height as determined ahead of time in experiment code)
- final_right = final height of right bar (with jitter - this is the same as left_height and right_height as determined ahead of time in experiment code)
- left_texture = as above
- right_texture = as above
- prompt = as above
*/
var jsPsychTextureBarChoice = (function (jspsych) {
  "use strict";

  const info = {
    name: "texture-bar-choice",
    parameters: {
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
      left_texture: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Left bar texture",
        default: "",
      },
      right_texture: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Right bar texture",
        default: "",
      },
      left_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Left bar height",
        default: 4,
      },
      right_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Right bar height",
        default: 4,
      },
      bg_color: {
        type: jspsych.ParameterType.STRING,
        default: "#ffffff",
      },
      choices: {
        type: jspsych.ParameterType.KEYS,
        default: ["f", "j"],
      },
      correct_side: {
        type: jspsych.ParameterType.STRING,
        default: null,
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        default: true,
      },
    },
  };

  class TextureBarChoicePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // --- CURRENT trial heights -- Heights determined in the experiment script ---
      const final_left = trial.left_height;
      const final_right = trial.right_height;

      // --- FUNCTION TO CREATE ONE TRIAL DISPLAY ---

      function createTrialDisplay(trial_info, label, bg_color) {
        //If there is no next trial, then end of block
        if (!trial_info) {
          return `
          
              <div style="
              flex:1;
              min-width:0;
              display:flex;
              flex-direction:column;
              align-items:center;
              justify-content:center;
              padding:20px;
              box-sizing:border-box;
            ">

              <div style="
                font-size:26px;
                font-weight:bold;
                margin-bottom:20px;
              ">
                END OF BLOCK
              </div>

              <div style="
                font-size:20px;
                text-align:center;
              ">
                Prepare for the block break.
              </div>
            </div>      
          `;
        }

        const display_left_height = trial_info.final_left;
        const display_right_height = trial_info.final_right;

        return `<div style="
            flex:1;
            min-width:0;
            display:flex;
            flex-direction:column;
            align-items:center;
            padding:15px 200px;
            box-sizing:border-box;
          ">

            <!-- Trial label -->

            <div style="
              font-size:26px;
              font-weight:bold;
              margin-bottom:20px;
            ">
              ${label}
            </div>

            <!-- Target concept -->

            <div style="
              font-size:30px;
              margin-bottom:25px;
            ">
              ${trial_info.prompt || ""}
            </div>

            <!-- Main display area -->

            <div style="
              width:100%;
              display:flex;
              justify-content:center;
              align-items:flex-start;
              gap:50px;
            ">

              <!-- ================= LEFT BAR ================= -->

              <div style="
                width:140px;
                display:flex;
                flex-direction:column;
                align-items:center;
              ">

                <!-- Height scale -->

                <div style="
                  width:100px;
                  height:260px;
                  display:flex;
                  flex-direction:column;
                  justify-content:space-between;
                  align-items:center;
                ">

                  ${[8, 7, 6, 5, 4, 3, 2, 1]
                    .map(
                      (level) => `
                        <div style="
                          width:80px;
                          height:24px;
                          display:flex;
                          align-items:center;
                          justify-content:center;
                          position:relative;
                          ${
                            level === display_right_height
                              ? "background:rgba(255, 220, 0, 0.35);"
                              : ""
                          }
                        ">

                          <span style="
                            font-size:14px;
                            width:25px;
                            text-align:right;
                            margin-right:8px;
                          ">
                            ${level}
                          </span>

                          <span style="
                            display:block;
                            width:30px;
                            height:2px;
                            background:black;
                          ">
                          </span>
                        </div>
                      `,
                    )
                    .join("")}

                </div>

                <!-- Left visual bar -->

                <!--
                  IMPORTANT:
                  The experimenter's left visual bar displays
                  trial_info.right_texture because left/right are
                  reversed for the experimenter.
                -->

                <div style="
                  width:130px;
                  height:160px;
                  border:3px solid black;
                  box-sizing:border-box;
                  background:${bg_color};
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  margin-top:15px;
                ">

                  <span style="
                    font-size:20px;
                    text-align:center;
                    line-height:1.2;
                    padding:8px;
                    overflow-wrap:anywhere;
                  ">
                    ${trial_info.right_texture || ""}
                  </span>
                </div>
              </div>

              <!-- ================= RIGHT BAR ================= -->

              <div style="
                width:140px;
                display:flex;
                flex-direction:column;
                align-items:center;
              ">

                <!-- Height scale -->
                <div style="
                  width:100px;
                  height:260px;
                  display:flex;
                  flex-direction:column;
                  justify-content:space-between;
                  align-items:center;
                ">

                  ${[8, 7, 6, 5, 4, 3, 2, 1]
                    .map(
                      (level) => `
                        <div style="
                          width:80px;
                          height:24px;
                          display:flex;
                          align-items:center;
                          justify-content:center;
                          position:relative;
                          ${
                            level === display_left_height
                              ? "background:rgba(255, 220, 0, 0.35);"
                              : ""
                          }
                        ">

                          <span style="
                            font-size:14px;
                            width:25px;
                            text-align:right;
                            margin-right:8px;
                          ">
                            ${level}
                          </span>

                          <span style="
                            display:block;
                            width:30px;
                            height:2px;
                            background:black;
                          ">
                          </span>
                        </div>
                      `,
                    )
                    .join("")}

                </div>

                <!-- Right visual bar -->
                <!--
                  IMPORTANT:
                  The experimenter's right visual bar displays
                  trial_info.left_texture because left/right are
                  reversed for the experimenter.
                -->

                <div style="
                  width:130px;
                  height:160px;
                  border:3px solid black;
                  box-sizing:border-box;
                  background:${bg_color};
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  margin-top:15px;
                ">

                  <span style="
                    font-size:20px;
                    text-align:center;
                    line-height:1.2;
                    padding:8px;
                    overflow-wrap:anywhere;
                  ">
                    ${trial_info.left_texture || ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // --- Create CURRENT trial + NEXT trial diaplay ---

      let html = `
      <div style="
          background:${trial.bg_color};
          width:100%;
          height:100%;
          min-height:100vh;
          display:flex;
          flex-direction:row;
          text-align:center;
          box-sizing:border-box;
        ">

          <!-- CURRENT TRIAL -->

          ${createTrialDisplay(
            {
              prompt: trial.prompt,
              final_left: trial.left_height,
              final_right: trial.right_height,
              left_texture: trial.left_texture,
              right_texture: trial.right_texture,
            },
            "CURRENT TRIAL",
            trial.bg_color,
          )}

          <!-- Divider -->

          <div style="
            width:3px;
            background:black;
            margin:20px 0;
            flex-shrink:0;
          "></div>

          <!-- NEXT TRIAL -->

          ${createTrialDisplay(trial.next_trial, "NEXT TRIAL", trial.bg_color)}

        </div>
      `;

      display_element.innerHTML = html;

      // --- Response handling ---
      let response = {
        rt: null,
        key: null,
      };

      const end_trial = () => {
        this.jsPsych.pluginAPI.clearAllTimeouts();

        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        let chosen_side = null;

        if (response.key !== null) {
          if (response.key === trial.choices[0]) {
            chosen_side = "left";
          } else if (response.key === trial.choices[1]) {
            chosen_side = "right";
          }
        }

        let accuracy = null;
        if (trial.correct_side !== null && chosen_side !== null) {
          accuracy = chosen_side === trial.correct_side ? 1 : 0;
        }

        // --- Save CURRENT trial data only ---
        const trial_data = {
          rt: response.rt,
          key: response.key,

          prompt: trial.prompt,

          chosen_side,
          correct_side: trial.correct_side,
          accuracy,

          final_left,
          final_right,

          left_texture: trial.left_texture,
          right_texture: trial.right_texture,
        };

        display_element.innerHTML = "";

        this.jsPsych.finishTrial(trial_data);
      };

      const after_response = (info) => {
        if (response.key === null) {
          response = info;
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      };

      // --- Keyboard listener ---
      if (trial.choices != "NO_KEYS") {
        var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
        });
      }

      // --- Trial duration ---

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
    }
  }

  TextureBarChoicePlugin.info = info;
  return TextureBarChoicePlugin;
})(jsPsychModule);
