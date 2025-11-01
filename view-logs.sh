#!/bin/bash

# Log viewer script for NestJS application
LOG_BASE_DIR="logs"
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)
CURRENT_DAY=$(date +%d)
CURRENT_LOG_DIR="$LOG_BASE_DIR/$CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DAY"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    🔍 NestJS Log Viewer                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${BLUE}📅 Date:${NC} $CURRENT_DATE"
echo -e "${BLUE}📁 Path:${NC} $CURRENT_LOG_DIR"
echo ""

if [ ! -d "$LOG_BASE_DIR" ]; then
    echo -e "${RED}❌ Error: Log directory not found${NC}"
    exit 1
fi

# Count logs for today
if [ -d "$CURRENT_LOG_DIR" ]; then
    error_count=$([ -f "$CURRENT_LOG_DIR/error-$CURRENT_DATE.log" ] && wc -l < "$CURRENT_LOG_DIR/error-$CURRENT_DATE.log" | tr -d ' ' || echo "0")
    general_count=$([ -f "$CURRENT_LOG_DIR/general-$CURRENT_DATE.log" ] && wc -l < "$CURRENT_LOG_DIR/general-$CURRENT_DATE.log" | tr -d ' ' || echo "0")
    echo -e "${GREEN}📊 Today's Stats:${NC} ${YELLOW}$general_count${NC} general logs, ${RED}$error_count${NC} error logs"
else
    echo -e "${YELLOW}⚠️  No logs found for today${NC}"
fi

# Show recent dates
echo ""
echo -e "${PURPLE}📂 Recent Log Dates:${NC}"
find "$LOG_BASE_DIR" -type d -name "[0-9][0-9]" 2>/dev/null | \
    sed 's|.*/\([0-9]\{4\}\)/\([0-9]\{2\}\)/\([0-9]\{2\}\)|\1-\2-\3|' | \
    sort -u | tail -n 5 | while read date; do
        echo -e "   ${CYAN}•${NC} $date"
    done

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}  1.${NC} 🚨 Error Logs (Today)"
echo -e "${GREEN}  2.${NC} ℹ️  General Logs (Today)"
echo -e "${GREEN}  3.${NC} 👁️  Live Monitoring"
echo -e "${GREEN}  4.${NC} 📅 Specific Date"
echo -e "${GREEN}  5.${NC} 📊 Statistics"
echo -e "${GREEN}  6.${NC} 🔍 Search Logs"
echo -e "${GREEN}  7.${NC} 📜 Last N Lines"
echo -e "${GREEN}  0.${NC} 🚪 Exit"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
read -p "$(echo -e ${YELLOW}'Choose (0-7): '${NC})" choice

format_log() {
    while IFS= read -r line; do
        if echo "$line" | jq empty 2>/dev/null; then
            ts=$(echo "$line" | jq -r '.timestamp // empty')
            lvl=$(echo "$line" | jq -r '.level // empty')
            msg=$(echo "$line" | jq -r '.message // empty')
            
            case "$lvl" in
                "ERROR") echo -e "${RED}[$ts] ❌ $msg${NC}" ;;
                "WARN") echo -e "${YELLOW}[$ts] ⚠️  $msg${NC}" ;;
                "INFO") echo -e "${GREEN}[$ts] ℹ️  $msg${NC}" ;;
                *) echo "$line" ;;
            esac
        else
            echo "$line"
        fi
    done
}

case $choice in
    1)
        clear
        echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                    🚨 Error Logs (Today)                       ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        if [ -f "$CURRENT_LOG_DIR/error-$CURRENT_DATE.log" ] && [ -s "$CURRENT_LOG_DIR/error-$CURRENT_DATE.log" ]; then
            lines=$(wc -l < "$CURRENT_LOG_DIR/error-$CURRENT_DATE.log" | tr -d ' ')
            echo -e "${BLUE}📄 error-$CURRENT_DATE.log${NC} ${YELLOW}($lines lines)${NC}"
            echo ""
            tail -n 30 "$CURRENT_LOG_DIR/error-$CURRENT_DATE.log" | format_log
        else
            echo -e "${GREEN}✅ No errors today!${NC}"
        fi
        ;;
        
    2)
        clear
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                  ℹ️  General Logs (Today)                      ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        if [ -f "$CURRENT_LOG_DIR/general-$CURRENT_DATE.log" ] && [ -s "$CURRENT_LOG_DIR/general-$CURRENT_DATE.log" ]; then
            lines=$(wc -l < "$CURRENT_LOG_DIR/general-$CURRENT_DATE.log" | tr -d ' ')
            echo -e "${BLUE}📄 general-$CURRENT_DATE.log${NC} ${YELLOW}($lines lines)${NC}"
            echo ""
            tail -n 30 "$CURRENT_LOG_DIR/general-$CURRENT_DATE.log" | format_log
        else
            echo -e "${YELLOW}⚠️  No general logs found${NC}"
        fi
        ;;
        
    3)
        clear
        echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║              👁️  Live Monitoring (Ctrl+C to stop)              ║${NC}"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        if [ -d "$CURRENT_LOG_DIR" ]; then
            # List available files
            log_files=("$CURRENT_LOG_DIR"/*.log "$CURRENT_LOG_DIR"/*.json)
            valid_files=()
            for f in "${log_files[@]}"; do
                [ -f "$f" ] && valid_files+=("$f")
            done
            
            if [ ${#valid_files[@]} -eq 0 ]; then
                echo -e "${RED}❌ No log files to monitor${NC}"
            else
                echo -e "${GREEN}Monitoring ${#valid_files[@]} file(s):${NC}"
                for f in "${valid_files[@]}"; do
                    echo -e "  ${CYAN}•${NC} $(basename "$f")"
                done
                echo ""
                echo -e "${YELLOW}Press Ctrl+C to stop...${NC}"
                echo ""
                
                # Use tail -f on all files without format_log to avoid buffering
                tail -f "${valid_files[@]}" 2>/dev/null
            fi
        else
            echo -e "${RED}❌ No logs for today${NC}"
            echo -e "${YELLOW}Directory: $CURRENT_LOG_DIR${NC}"
        fi
        ;;
        
    4)
        clear
        echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${PURPLE}║                    📅 View Specific Date                       ║${NC}"
        echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        read -p "Enter date (YYYY-MM-DD): " log_date
        y=$(echo $log_date | cut -d'-' -f1)
        m=$(echo $log_date | cut -d'-' -f2)
        d=$(echo $log_date | cut -d'-' -f3)
        dir="$LOG_BASE_DIR/$y/$m/$d"
        
        echo ""
        if [ -d "$dir" ]; then
            echo -e "${GREEN}✓ Found logs for $log_date${NC}"
            echo -e "${BLUE}📁 Directory: $dir${NC}"
            echo ""
            
            # List all files first
            files=("$dir"/*.log "$dir"/*.json)
            valid_files=()
            for f in "${files[@]}"; do
                [ -f "$f" ] && valid_files+=("$f")
            done
            
            if [ ${#valid_files[@]} -eq 0 ]; then
                echo -e "${YELLOW}No log files found${NC}"
            else
                echo -e "${YELLOW}Found ${#valid_files[@]} file(s)${NC}"
                echo ""
                
                # Show file list with numbers
                i=1
                for file in "${valid_files[@]}"; do
                    name=$(basename "$file")
                    size=$(ls -lh "$file" | awk '{print $5}')
                    lines=$(wc -l < "$file" | tr -d ' ')
                    echo -e "${GREEN}  $i.${NC} ${CYAN}$name${NC} ${YELLOW}($size, $lines lines)${NC}"
                    ((i++))
                done
                
                echo ""
                echo -e "${YELLOW}Options:${NC}"
                echo -e "  ${GREEN}1-${#valid_files[@]}${NC} View specific file"
                echo -e "  ${GREEN}a${NC} View all files (preview)"
                echo -e "  ${GREEN}0${NC} Back to menu"
                echo ""
                read -p "Choose: " file_choice
                
                if [ "$file_choice" == "a" ]; then
                    # Show preview of all files
                    for file in "${valid_files[@]}"; do
                        name=$(basename "$file")
                        echo ""
                        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                        echo -e "${BLUE}📄 $name${NC}"
                        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                        
                        if [[ "$name" == *.json ]]; then
                            if command -v jq &> /dev/null; then
                                head -n 10 "$file" | jq -C '.' 2>/dev/null || head -n 10 "$file"
                            else
                                head -n 10 "$file"
                            fi
                        else
                            head -n 10 "$file" | format_log
                        fi
                    done
                elif [[ "$file_choice" =~ ^[0-9]+$ ]] && [ "$file_choice" -ge 1 ] && [ "$file_choice" -le ${#valid_files[@]} ]; then
                    # View specific file
                    file="${valid_files[$((file_choice-1))]}"
                    name=$(basename "$file")
                    lines=$(wc -l < "$file" | tr -d ' ')
                    
                    clear
                    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                    echo -e "${BLUE}📄 $name${NC} ${YELLOW}($lines lines)${NC}"
                    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                    echo ""
                    
                    # For small files (< 100 lines), show directly; for large files, use less
                    if [ "$lines" -lt 100 ]; then
                        if [[ "$name" == *.json ]]; then
                            if command -v jq &> /dev/null; then
                                jq -C '.' "$file" 2>/dev/null
                            else
                                cat "$file"
                            fi
                        else
                            format_log < "$file"
                        fi
                    else
                        echo -e "${YELLOW}File is large. Press 'q' to exit viewer.${NC}"
                        echo ""
                        sleep 1
                        if [[ "$name" == *.json ]]; then
                            if command -v jq &> /dev/null; then
                                jq -C '.' "$file" 2>/dev/null | less -R
                            else
                                less "$file"
                            fi
                        else
                            format_log < "$file" | less -R
                        fi
                    fi
                fi
            fi
        else
            echo -e "${RED}❌ No logs for $log_date${NC}"
            echo -e "${YELLOW}Expected path: $dir${NC}"
        fi
        ;;
        
    5)
        clear
        echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}║                      📊 Statistics                             ║${NC}"
        echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        if [ -d "$CURRENT_LOG_DIR" ]; then
            for file in "$CURRENT_LOG_DIR"/*.log "$CURRENT_LOG_DIR"/*.json; do
                if [ -f "$file" ]; then
                    name=$(basename "$file")
                    size=$(ls -lh "$file" | awk '{print $5}')
                    lines=$(wc -l < "$file" | tr -d ' ')
                    
                    echo -e "  ${CYAN}📄 $name${NC}"
                    echo -e "     Size: ${YELLOW}$size${NC}, Lines: ${YELLOW}$lines${NC}"
                    
                    if [ -s "$file" ]; then
                        errors=$(grep -c '"level":"ERROR"' "$file" 2>/dev/null || echo "0")
                        warns=$(grep -c '"level":"WARN"' "$file" 2>/dev/null || echo "0")
                        infos=$(grep -c '"level":"INFO"' "$file" 2>/dev/null || echo "0")
                        
                        # For JSON files, count REQUEST/RESPONSE types
                        if [[ "$name" == *.json ]]; then
                            requests=$(grep -c '"type":"REQUEST"' "$file" 2>/dev/null || echo "0")
                            responses=$(grep -c '"type":"RESPONSE"' "$file" 2>/dev/null || echo "0")
                            if [ "$requests" -gt 0 ] || [ "$responses" -gt 0 ]; then
                                echo -e "     ${CYAN}Requests: $requests${NC} | ${GREEN}Responses: $responses${NC}"
                            fi
                        fi
                        
                        if [ "$errors" -gt 0 ] || [ "$warns" -gt 0 ] || [ "$infos" -gt 0 ]; then
                            echo -e "     ${RED}Errors: $errors${NC} | ${YELLOW}Warns: $warns${NC} | ${GREEN}Info: $infos${NC}"
                        fi
                    fi
                    echo ""
                fi
            done
        else
            echo -e "${YELLOW}  No logs for today${NC}"
        fi
        ;;
        
    6)
        clear
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                      🔍 Search Logs                            ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        read -p "Search term: " term
        read -p "Last N days (default 7): " days
        days=${days:-7}
        
        echo ""
        echo -e "${BLUE}Searching '$term' in last $days days...${NC}"
        echo ""
        
        found=0
        find "$LOG_BASE_DIR" -type f \( -name "*.log" -o -name "*.json" \) -mtime -$days | while read file; do
            if grep -qi "$term" "$file" 2>/dev/null; then
                name=$(basename "$file")
                path=$(dirname "$file" | sed "s|$LOG_BASE_DIR/||")
                
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${GREEN}📄 $path/$name${NC}"
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                
                if [[ "$name" == *.json ]] && command -v jq &> /dev/null; then
                    grep -i "$term" "$file" | head -10 | jq -C '.' 2>/dev/null || grep -i "$term" "$file" | head -10
                else
                    grep -i "$term" "$file" | head -10 | format_log
                fi
                echo ""
                found=1
            fi
        done
        
        [ "$found" -eq 0 ] && echo -e "${YELLOW}No results${NC}"
        ;;
        
    7)
        clear
        echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${PURPLE}║                     📜 Last N Lines                            ║${NC}"
        echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        read -p "Number of lines (default 50): " n
        n=${n:-50}
        
        echo ""
        if [ -d "$CURRENT_LOG_DIR" ]; then
            for file in "$CURRENT_LOG_DIR"/*.log "$CURRENT_LOG_DIR"/*.json; do
                if [ -f "$file" ] && [ -s "$file" ]; then
                    name=$(basename "$file")
                    
                    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                    echo -e "${BLUE}📄 $name${NC} ${YELLOW}(last $n lines)${NC}"
                    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                    
                    # For JSON files, pretty print if possible
                    if [[ "$name" == *.json ]]; then
                        if command -v jq &> /dev/null; then
                            tail -n $n "$file" | jq -C '.' 2>/dev/null || tail -n $n "$file"
                        else
                            tail -n $n "$file"
                        fi
                    else
                        tail -n $n "$file" | format_log
                    fi
                    echo ""
                fi
            done
        else
            echo -e "${RED}❌ No logs for today${NC}"
        fi
        ;;
        
    0)
        clear
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        ;;
esac

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
read -p "Press Enter to continue..."
exec "$0"
