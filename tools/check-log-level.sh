# ==============================================================================
# Check that logging is disabled (intended for use as a prehook prior to build
# and deployment)

# Path to JavaScript directory, specified relative to the project root
declare -r JS_PATH="./src/js"

shopt -s extglob

# ------------------------------------------------------------------------------
# Checks all .js files in the specified directory for occurrences of the regex
# to detect LOGLEV set to anything other than Level.None

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
  # Check for occurrences of the supplied regex, i.e. check the LOGLEV setting

  echo -e "-> Checking that console logging is disabled"
  echo -e "   (i.e. checking that LOGLEV = Level.None)"
  echo -e "Path to check: '$js_dir'"

  # Use a regex to grep the .js files for whether log level is set to anything
  # other than Level.None
  # Exclude lines which start with any variation on ' * ' (i.e. jsdoc lines)
  declare -r regex="^\s*[^*]*\s*LOGLEV\s*=\s*Level\.[^N]"

  grep_res=$( grep -E "$regex" "$js_dir/"*.js )

  if [[ -n "$grep_res" ]]; then
    echo -e "\n----------------------------------------"
    echo -e "Error: LOGLEV must be set to Level.None"
    echo -e "- LOGLEV is set to something other than Level.None in at least one .js file."
    echo -e "- Please ensure 'LOGLEV = Level.None' before building."

    echo -e "\nGrep results:\n$grep_res"

    echo -e "----------------------------------------\n"
    return "$fail_retval"
  fi

  return "$success_retval"
}

# ==============================================================================
# Main

check_settings "$JS_PATH"

# ------------------------------------------------------------------------------
