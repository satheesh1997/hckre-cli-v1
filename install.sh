CHANNEL="stable"
CURRENT_DIR=$(pwd)
INSTALL_LOG_FILE="${CURRENT_DIR}/hckre-install.log"

command_exists() {
  command -v "$@" > /dev/null 2>&1
}

log() {
  echo "$@" >> "${INSTALL_LOG_FILE}"
}

error() {
  printf "${RED}ERROR:${NC} %s\n" "${1}" >&2
  log "$(printf "ERROR: %s\n" "${1}")"
  exit 1
}

get_operating_system() {
  SHORT_UNAME=$(uname -s)
  if [ "${SHORT_UNAME:0:5}" == "Linux" ]; then
    echo "linux"
  else
    error "Unsupported platform $(uname). Only linux is supported :("
    return 1
  fi
}

get_arch() {
  if [ "$(uname -m)" == "x86_64" ]; then
    echo "x64"
  elif [[ "$(uname -m)" == arm* ]]; then
    echo "arm"
  else
    error "Unsupported arch $(uname -m)"
    return 1
  fi
}

grab_download_link() {
  DOWNLOAD_LINK=$(compute_download_link)
  DOWNLOAD_COMMAND=$(grab_silent_command)
  log "${DOWNLOAD_COMMAND} ${DOWNLOAD_LINK}"
  if OUTPUT=$(${DOWNLOAD_COMMAND} "${DOWNLOAD_LINK}") ; then
      echo "${OUTPUT}" | jq '.gz' | tr -d \"
  else
    return 1
  fi
}

grab_download_version() {
  DOWNLOAD_LINK=$(compute_download_link)
  DOWNLOAD_COMMAND=$(grab_silent_command)
  log "${DOWNLOAD_COMMAND} ${DOWNLOAD_LINK}"
  if OUTPUT=$(${DOWNLOAD_COMMAND} "${DOWNLOAD_LINK}") ; then
      echo "${OUTPUT}" | jq '.version' | tr -d \"
  else
    return 1
  fi
}


grab_silent_command() {
  if command_exists curl; then
    echo "curl -fsSL"
  elif command_exists wget; then
    echo "wget -qO-"
  else
    error "curl or wget are missing"
    return 1
  fi
}

check_requirements() {
  get_operating_system > /dev/null
  get_arch > /dev/null
  grab_silent_command > /dev/null
  check_jq > /dev/null
}

check_jq() {
    if command_exists jq; then
        echo "jq"
    else
        error "jq is missing"
        return 1
    fi
}

check_bin_path() {
  if [[ ! ":${PATH}:" == *":/usr/local/bin:"* ]]; then
    error "Your path is missing /usr/local/bin, you need to add this to use this installer."
  fi
}

compute_download_link() {
  OS=$(get_operating_system)
  ARCH=$(get_arch)
  echo "https://hckre-cli.s3.ap-south-1.amazonaws.com/channels/$CHANNEL/$OS-$ARCH"
}

get_current_version(){
 if ! command_exists hckre; then
     echo ""
 else
    X=$(hckre version)
    IFS=' '
    read -a K <<< "$X"
    IFS='/'
    read -a VER <<< "$K"
    echo ${VER[1]}
 fi
}

grab_progress_command() {
  if command_exists curl; then
    echo "curl -#fSL"
  elif command_exists wget; then
    wget --help | grep -q '\--show-progress' && PROGRESS_OPT="-q --show-progress" || PROGRESS_OPT="-q"
    echo "wget ${PROGRESS_OPT} -O-"
  else
    error "curl or wget are missing"
    return 1
  fi
}


init_constants() {
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  BOLD='\033[1m'
  NC='\033[0m'
}

cleanup_previous_install() {
  log "rm -rf hckre"
  rm -rf hckre
  log "rm -rf ~/.local/share/hckre/client"
  rm -rf ~/.local/share/hckre/client
}

hckre_install() {

    init_constants

    cleanup_previous_install

    check_bin_path

    check_requirements

    CURRENT_VERSION=$(get_current_version)

    if ! REDIRECT_LINK=$(grab_download_link) ; then
        error "No download link found at $(compute_download_link)"
        return 1
    fi

    if [ -z "${REDIRECT_LINK}" ]; then
        error "Missing redirect link from the download link $(compute_download_link). Content found is '${REDIRECT_LINK}''"
        return 1
    fi


    if ! VERSION=$(grab_download_version) ; then
        error "No version found at $(compute_download_link)"
        return 1
    fi

    if [ -z "${VERSION}" ]; then
        error "Missing version from the download link $(compute_download_link)"
        return 1
    fi

    if [ "${CURRENT_VERSION}" == "${VERSION}" ]; then
        error "Already the latest version"
        return 1
    fi

    echo "Downloading ${REDIRECT_LINK}..."
    DOWNLOAD_COMMAND=$(grab_progress_command)
    log "${DOWNLOAD_COMMAND} ${REDIRECT_LINK} | tar xz"
    if ! OUTPUT=$(${DOWNLOAD_COMMAND} "${REDIRECT_LINK}" | tar xz) ; then
        error "Unable to download hckre binary from ${REDIRECT_LINK}"
        return 1
    fi

    SUDO=''

    if [ "$(id -u)" != "0" ]; then
        echo "hckre script requires superuser access"
        echo "You will be prompted for your password by sudo"
        SUDO='sudo'
        sudo -k
    fi

    ${SUDO} rm -rf /usr/local/lib/hckre
    ${SUDO} rm -rf /usr/local/bin/hckre

    ${SUDO} cp -r hckre /usr/local/lib/hckre
    ${SUDO} ln -s /usr/local/lib/hckre/bin/hckre /usr/local/bin/hckre

    rm -rf hckre

    if command_exists hckre; then
        LOCATION=$(command -v hckre)
        printf "${GREEN}SUCCESS:${NC} hckre installed to ${BOLD}%s${NC}\n" "${LOCATION}"
        printf "${GREEN}SUCCESS:${NC} installation log written in ${BOLD}%s${NC}\n" "${INSTALL_LOG_FILE}"
        hckre info
    else
        error "failure during installation, hckre command is not available in the PATH"
    fi
}

hckre_install
