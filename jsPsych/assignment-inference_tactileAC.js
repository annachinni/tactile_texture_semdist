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
- left_height_range = range of heights for left bar - these are the peg values on the tactiel bar graph (1-8 possible pegs)
- right_height_range = range of heights for right bar - these are the peg values on the tactiel bar graph (1-8 possible pegs)
- left_texture = texture id for left bar
- right_texture = texture id for right bar
- bg_color = background color (this should be the same as the document background color)
- response_ends_trial = if true, trial ends when response is made
- correct_side = "left" or "right", for accuracy coding
- trial_duration = maximum duration of trial in ms (optional)
- jitter = jitter applied to bar heights - default is +/- 1 peg

Data:
- rt = reaction time
- key = key pressed
- chosen_side = "left" or "right"
- correct_side = as above
- accuracy = 1 if correct, 0 if incorrect, null if correct_side is null or no response
- final_left = final height of left bar (with jitter)
- final_right = final height of right bar (with jitter)
- left_texture = as above
- right_texture = as above
- left_jitter = jitter applied to left bar height - default is +/- 1 peg
- right_jitter = jitter applied to right bar height - default is +/- 1 peg
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
      left_height_range: {
        type: jspsych.ParameterType.INT,
        array: true,
        default: [4, 4],
      },
      right_height_range: {
        type: jspsych.ParameterType.INT,
        array: true,
        default: [4, 4],
      },
      jitter: {
        type: jspsych.ParameterType.INT,
        default: 1,
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
      // --- Randomized heights (used for vertical scaling) ---
      const left_height = this.jsPsych.randomization.randomInt(
        trial.left_height_range[0],
        trial.left_height_range[1],
      );
      const right_height = this.jsPsych.randomization.randomInt(
        trial.right_height_range[0],
        trial.right_height_range[1],
      );

      const left_jitter = Math.round((Math.random() * 2 - 1) * trial.jitter);
      const right_jitter = Math.round((Math.random() * 2 - 1) * trial.jitter);

      const final_left = left_height + left_jitter;
      const final_right = right_height + right_jitter;

      // --- HTML structure ---
      let html = `
  <div style="
    background:${trial.bg_color};
    width:100%;
    height:100%;
    text-align:center;
  ">

    <!-- Target concept -->
    <div style="
      font-size:32px;
      margin-bottom:40px;
    ">
      ${trial.prompt || ""}
    </div>


    <!-- Main display area -->
    <div style="
      width:600px;
      margin:0 auto;
      display:flex;
      justify-content:center;
      align-items:flex-end;
      gap:120px;
    ">


      <!-- ================= LEFT BAR ================= -->

      <div style="
        width:160px;
        display:flex;
        flex-direction:column;
        align-items:center;
      ">

        <!-- Height scale -->
        <div style="
          width:100px;
          height:300px;
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
              height:28px;
              display:flex;
              align-items:center;
              justify-content:center;
              position:relative;
              ${
                level === final_right
                  ? "background:rgba(255, 220, 0, 0.35);"
                  : ""
              }
            ">

              <span style="
                font-size:16px;
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


        <!-- Left bar -->
        <div style="
          width:140px;
          height:180px;
          border:3px solid black;
          box-sizing:border-box;
          background:${trial.bg_color};
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:20px;
        ">
          <span style="
            font-size:22px;
            text-align:center;
            line-height:1.2;
            padding:10px;
            overflow-wrap:anywhere;
          ">
            ${trial.right_texture || ""}
          </span>
        </div>

      </div>


      <!-- ================= RIGHT BAR ================= -->

      <div style="
        width:160px;
        display:flex;
        flex-direction:column;
        align-items:center;
      ">

        <!-- Height scale -->
        <div style="
          width:100px;
          height:300px;
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
              height:28px;
              display:flex;
              align-items:center;
              justify-content:center;
              position:relative;
              ${
                level === final_left
                  ? "background:rgba(255, 220, 0, 0.35);"
                  : ""
              }
            ">

              <span style="
                font-size:16px;
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


        <!-- Right bar -->
        <div style="
          width:140px;
          height:180px;
          border:3px solid black;
          box-sizing:border-box;
          background:${trial.bg_color};
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:20px;
        ">
          <span style="
            font-size:22px;
            text-align:center;
            line-height:1.2;
            padding:10px;
            overflow-wrap:anywhere;
          ">
            ${trial.left_texture || ""}
          </span>
        </div>

      </div>

    </div>
  </div>
`;

      display_element.innerHTML = html;

      // --- Response handling ---
      let response = { rt: null, key: null };

      const end_trial = () => {
        this.jsPsych.pluginAPI.clearAllTimeouts();
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        let chosen_side = null;
        if (response.key !== null) {
          if (response.key === trial.choices[0]) chosen_side = "left";
          else if (response.key === trial.choices[1]) chosen_side = "right";
        }

        let accuracy = null;
        if (trial.correct_side !== null && chosen_side !== null) {
          accuracy = chosen_side === trial.correct_side ? 1 : 0;
        }

        const trial_data = {
          rt: response.rt,
          key: response.key,
          prompt: trial.prompt,
          chosen_side,
          correct_side: trial.correct_side,
          accuracy,
          final_left,
          final_right,
          left_texture: trial.left_image,
          right_texture: trial.right_image,
          left_jitter,
          right_jitter,
        };

        display_element.innerHTML = "";
        this.jsPsych.finishTrial(trial_data);
      };

      const after_response = (info) => {
        if (response.key === null) response = info;
        if (trial.response_ends_trial) end_trial();
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
