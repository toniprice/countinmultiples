# ==============================================================================
# Check that debugging is disabled (intended for use prior to build and
# deployment)

# Path to JavaScript directory, specified relative to the project root
declare -r JS_PATH="./src/js"

# ------------------------------------------------------------------------------
# Checks all .js files in the specified directory for occurrences of the regex
# to detect DEBUG and/or VDBG being set to true

# Usage: check_settings <js_path>
#   js_path: Path to JavaScript directory, specified relative to the project root

function check_settings {

  # ------------------------------------
  local -r fail_retval=254
  local -r success_retval=0

  local exp_n_args=1

  local args=( "$@" )
  local n_args_recvd=${#@}

  if [[ $n_args_recvd -ne $exp_n_args ]]; then
    echo -e "\nError: Incorrect no. of args (expected $exp_n_args but got $n_args_recvd)"
    echo -e "\nArgs: [${args[*]}]"
    return "$fail_retval"
  fi

  local js_dir="$1"
  shift

  # ------------------------------------
  # Initialise other local vars

  local grep_res

  # ------------------------------------
  # Validate location of .js files

  js_dir=$( realpath "$js_dir" )

  if [[ ! -d "$js_dir" ]] || [[ ! -r "$js_dir" ]]; then
    echo -e "\nError: JS dir '$js_dir' not found or not readable.\n"
    return "$fail_retval"
  fi

  # ------------------------------------
  # Check for occurrences of the supplied regex, i.e. check the DEBUG/VDBG settings

  echo -e "-> Checking that console logging is disabled (via DEBUG|VDBG settings)"

  echo -e "\nPath to check: '$js_dir'"

  # Grep the .js files for whether DEBUG and/or VDBG are set to true anywhere


  # Regex to check for DEBUG and/or VDBG being set to true
  # Note: A more inclusive regex would be ".*(DEBUG|VDBG) = true.*"
  declare -r regex="^[[:space:]]*(DEBUG|VDBG) = true"

  grep_res=$( grep -E "$regex" "$js_dir/"*.js )

  if [[ -n "$grep_res" ]]; then
    echo -e "\n----------------------------------------"
    echo -e "Error: DEBUG and/or VDBG must be set to false"
    echo -e "- DEBUG and/or VDBG are set to true in at least one .js file."
    echo -e "- Please ensure DEBUG and VDBG are set to false before building."
    echo -e "  (check for occurrences of 'DEBUG = true' and 'VDBG = true' in .js files)"
    echo -e "----------------------------------------\n"
    return "$fail_retval"
  fi

  return "$success_retval"
}

# ==============================================================================
# Main

check_settings "$JS_PATH"

# ------------------------------------------------------------------------------
